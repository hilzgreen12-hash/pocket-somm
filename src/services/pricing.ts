import { fetchWinePrice } from '../api/wine-searcher';
import { getWineIntelligence, resolveWine } from '../api/label';
import { fetchWineFacts } from '../api/wineFacts';
import { wineQueryName } from '../utils/wineIdentity';
import { withBordeauxInfo } from '../constants/bordeauxClassification';
import type { GrapeVariant, PricingData, WineDetailsComplete, WineIntelligence } from '../types/wine';

// Collapse a wine name to a comparison key (lowercase, alphanumerics only) so we
// can tell whether Claude's canonical wsSearchName actually differs from the raw
// query — and skip a wasted second Wine-Searcher lookup when it doesn't.
function wsNameKey(s: string): string {
  return (s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

// Thrown when Vinster can't confirm a wine exists: the model doesn't recognise
// it AND Wine-Searcher has no listing. Callers show "couldn't find this wine"
// rather than a card — Vinster must never build intel for a non-existent wine.
export class WineNotFoundError extends Error {
  constructor() { super("Vinster couldn't find this wine."); this.name = 'WineNotFoundError'; }
}
export function isWineNotFound(e: unknown): boolean {
  return e instanceof Error && e.name === 'WineNotFoundError';
}

// When Vinster recognised a garbled name (dictation / OCR), return the details
// with the wine's correct spelling; otherwise the same object, untouched.
export function withCanonicalName(d: WineDetailsComplete, intel: WineIntelligence): WineDetailsComplete {
  if (intel.resolvedIdentity) {
    const r = intel.resolvedIdentity;
    return { ...d, producer: r.producer, wineName: r.wineName, region: r.region ?? d.region };
  }
  if (intel.identified !== true || !intel.canonicalProducer) return d;
  const producer = intel.canonicalProducer;
  const wineName = intel.canonicalWineName ?? d.wineName ?? null;
  if (producer === d.producer && wineName === (d.wineName ?? null)) return d;
  return { ...d, producer, wineName };
}

// Look a wine up on Wine-Searcher, retrying once with Claude's canonical
// wsSearchName when the raw scanned name misses. This closes the "cult producer
// with a finicky canonical name" gap (e.g. "Stella di Campalto … S Giuseppe Rosa"
// -> "… Podere San Giuseppe Rosa Brunello di Montalcino"). Only fires on a miss,
// so a normal match costs nothing extra.
async function resolveWsPricing(
  first: PricingData,
  queryName: string,
  wsSearchName: string | null | undefined,
  vintage: number | null,
  currency: string,
): Promise<PricingData> {
  const matched = first.source === 'wine-searcher' && first.matched !== false;
  if (matched || !wsSearchName) return first;
  if (wsNameKey(wsSearchName) === wsNameKey(queryName)) return first;
  const retry = await fetchPricing(wsSearchName, vintage, currency);
  const retryMatched = retry.source === 'wine-searcher' && retry.matched !== false;
  return retryMatched ? retry : first;
}

export async function fetchPricing(
  wineName: string,
  vintage: number | null,
  currency?: string
): Promise<PricingData> {
  try {
    return await fetchWinePrice(wineName, vintage, currency);
  } catch {
    return {
      matched: false,
      averageMarketPrice: null,
      minPrice: null,
      maxPrice: null,
      currency: currency ?? 'GBP',
      criticScore: null,
      source: 'unavailable',
    };
  }
}

// One row of the "Vintage & Market Comparison" table — a single vintage's
// Wine-Searcher critic score and market price (in the user's currency).
export interface VintageComparisonRow {
  vintage: number;
  score: number | null;
  price: number | null;
}

// Build a wine's per-vintage Wine-Searcher table (score + price) by probing a
// window of recent vintages through the existing pricing proxy — which caches
// each (wine, vintage), so a re-open is instant. Only EXACT-vintage listings are
// kept (the all-vintage average fallback is filtered out) so every row is real
// data for that year. Generated on request, since it's N live lookups.
export async function fetchVintageComparison(
  queryName: string,
  currency: string,
  scannedVintage: number | null,
): Promise<VintageComparisonRow[]> {
  const nowYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = nowYear - 1; y >= nowYear - 12; y--) years.push(y);
  if (scannedVintage && Number.isFinite(scannedVintage) && !years.includes(scannedVintage)) years.push(scannedVintage);
  const rows: VintageComparisonRow[] = [];
  // Small batches keep the Wine-Searcher request rate modest (the proxy handles
  // its own rate-limit retries).
  const BATCH = 3;
  for (let i = 0; i < years.length; i += BATCH) {
    const batch = years.slice(i, i + BATCH);
    const results = await Promise.all(batch.map(async (y) => {
      const p = await fetchPricing(queryName, y, currency);
      const exactHit = p.matched !== false && p.priceScope !== 'all-vintage' && (p.averageMarketPrice != null || p.criticScore != null);
      return exactHit ? { vintage: y, score: p.criticScore ?? null, price: p.averageMarketPrice ?? null } : null;
    }));
    for (const r of results) if (r) rows.push(r);
  }
  rows.sort((a, b) => b.vintage - a.vintage);
  return rows;
}

// Combined valuation for the wine card: real Wine-Searcher market data when
// the wine matches, with the Claude estimate as fallback. The critic score is
// always a Vinster score — but anchored to Wine-Searcher's ws-score (the
// "north star") when a match exists, so it's grounded in real data.
export interface WineValuation {
  estimatedValue: number | null;
  estimatedValueLow: number | null;
  estimatedValueHigh: number | null;
  currency: string;
  // Where the headline Estimated Value came from, for the card's source label.
  valueSource: 'wine-searcher' | 'vinster';
  criticScore: number | null;
  criticScoreNote: string | null;
  drinkingWindowFrom: number | null;
  drinkingWindowTo: number | null;
  drinkingWindowStatus: string;
  grapeVariety: string | null;
  // "The Inside Line" — sommelier-best-friend verdict, persisted to the cellar
  // row so the cellar wine card can show it like the scan intel card does.
  insiderNote: string | null;
  // Genuine grape ambiguity (same producer + name sold as more than one wine,
  // e.g. a Syrah AND a Chenin). When true the caller should confirm the variant
  // with the user before trusting the card. See WineIntelligence.grapeAmbiguous.
  grapeAmbiguous: boolean;
  grapeOptions: GrapeVariant[];
  tastingNotes: string | null;
  // Canonical identity anchor when Wine-Searcher matched (null otherwise).
  wsWineId?: string | null;
  wsWineName?: string | null;
  // 'vintage' | 'all-vintage' when the value is a real WS price; null otherwise.
  priceScope?: 'vintage' | 'all-vintage' | null;
}

export async function valueWine(
  wine: WineDetailsComplete,
  currency: string = 'GBP',
): Promise<WineValuation> {
  // Build the Wine-Searcher query from producer + wine name for the best match.
  const queryName = wineQueryName(wine.producer, wine.wineName) || (wine.wineName ?? '');
  const vintageNum = wine.vintage && wine.vintage !== 'NV' ? Number(wine.vintage) : null;

  const vintageArg = Number.isFinite(vintageNum) ? vintageNum : null;
  const first = await fetchPricing(queryName, vintageArg, currency);
  const firstMatched = first.source === 'wine-searcher' && first.matched !== false;

  // Claude fills drinking window, tasting notes, grape, (anchored) score, and a
  // canonical Wine-Searcher search name we fall back to when the raw query misses.
  const intel = await getWineIntelligence(wine, currency, firstMatched ? first.criticScore : null);

  // Retry Wine-Searcher with Claude's canonical name on a miss (cult-producer gap).
  const pricing = await resolveWsPricing(first, queryName, intel.wsSearchName, vintageArg, currency);
  const wsMatched = pricing.source === 'wine-searcher' && pricing.matched !== false;
  const wsScore = wsMatched ? pricing.criticScore : null;
  // Unrecognised by Vinster and no Wine-Searcher listing: no estimates at all.
  if (intel.identified === false && !wsMatched) throw new WineNotFoundError();

  // Headline value: real WS market average when matched, else Claude estimate.
  const useWs = wsMatched && pricing.averageMarketPrice != null;
  // Critic score: prefer Wine-Searcher's real aggregated ws-score directly (we
  // pay for it — surface it, don't just anchor Claude to it). Fall back to
  // Claude's estimated consensus only when WS has no score for this wine.
  const useWsScore = wsScore != null;

  return {
    estimatedValue: useWs ? pricing.averageMarketPrice : intel.estimatedValue,
    estimatedValueLow: useWs ? pricing.minPrice : (intel.estimatedValueLow ?? null),
    estimatedValueHigh: useWs ? pricing.maxPrice : (intel.estimatedValueHigh ?? null),
    currency: useWs ? pricing.currency : currency,
    valueSource: useWs ? 'wine-searcher' : 'vinster',
    criticScore: useWsScore ? wsScore : intel.criticScore,
    // A real WS aggregated score is authoritative — no "why it's missing" note.
    criticScoreNote: useWsScore ? null : (intel.criticScoreNote ?? null),
    drinkingWindowFrom: intel.drinkingWindowFrom ?? null,
    drinkingWindowTo: intel.drinkingWindowTo ?? null,
    drinkingWindowStatus: intel.drinkingWindowStatus ?? 'unknown',
    grapeVariety: intel.grapeVariety ?? null,
    insiderNote: intel.insiderNote ?? null,
    grapeAmbiguous: intel.grapeAmbiguous ?? false,
    grapeOptions: intel.grapeOptions ?? [],
    tastingNotes: intel.tastingNotes ?? null,
    wsWineId: wsMatched ? (pricing.wsWineId ?? null) : null,
    wsWineName: wsMatched ? (pricing.wsWineName ?? null) : null,
    // Only meaningful when the headline value is the real WS price.
    priceScope: useWs ? (pricing.priceScope ?? 'vintage') : null,
  };
}

// Full Wine Intel for the single-wine flows (Generate Wine Intel, add-to-cellar,
// stats batch, review estimate). Same Wine-Searcher-first logic as valueWine,
// but returns the complete WineIntelligence the intel card + add payload consume
// (vintage/rarity assessments, drinking window, per-critic scores, etc.), with
// the real WS market price + WS-anchored score + grape gap-fill merged in.
// fetchPricing already returns prices in the user's currency (proxy converts).
export async function generateWineIntel(
  wineIn: WineDetailsComplete,
  currency: string = 'GBP',
  // Internal: false on the retry after a web lookup, so it can't loop.
  allowResolve: boolean = true,
): Promise<WineIntelligence> {
  // Classified Bordeaux: fill classification (wine name) + appellation (region)
  // when blank, so intel is complete on EVERY path (scan, lineup, search…).
  const wine = withBordeauxInfo(wineIn);
  const queryName = wineQueryName(wine.producer, wine.wineName) || (wine.wineName ?? '');
  const vintageNum = wine.vintage && wine.vintage !== 'NV' ? Number(wine.vintage) : null;

  const vintageArg = Number.isFinite(vintageNum) ? vintageNum : null;

  // Permanent facts captured from a PRIOR Wine-Searcher match (region/grape/score),
  // read instantly and never expiring (see wine_facts / migration 110). Grows as
  // real lookups happen; used to ground intel without waiting on a live WS call.
  const facts = await fetchWineFacts(queryName, vintageArg);

  let first: PricingData;
  let intel: WineIntelligence;
  if (facts?.criticScore != null) {
    // Fast path: we already hold a real WS score to anchor Claude, so fetch the
    // (volatile) price and generate intel IN PARALLEL rather than waiting for WS.
    [first, intel] = await Promise.all([
      fetchPricing(queryName, vintageArg, currency),
      getWineIntelligence(wine, currency, facts.criticScore),
    ]);
  } else {
    // No permanent score yet → keep the original sequence so Claude is still
    // anchored to THIS session's WS score when there is one (no regression).
    first = await fetchPricing(queryName, vintageArg, currency);
    const firstMatched = first.source === 'wine-searcher' && first.matched !== false;
    // Claude fills the rich fields; wsScore anchors its critic score to WS. It also
    // returns wsSearchName — the canonical WS query we retry with on a miss.
    intel = await getWineIntelligence(wine, currency, firstMatched ? first.criticScore : null);
  }

  // Retry Wine-Searcher with Claude's canonical name on a miss (cult-producer gap).
  const pricing = await resolveWsPricing(first, queryName, intel.wsSearchName, vintageArg, currency);
  const wsMatched = pricing.source === 'wine-searcher' && pricing.matched !== false;
  // IDENTITY GATE: Vinster doesn't recognise the wine and Wine-Searcher has no
  // listing → it may not exist (misheard / misread). Never build a card for it.
  // (A prior permanent WS facts record counts as a real listing.)
  if (intel.identified === false && !wsMatched && facts?.criticScore == null) {
    // Last resort before "couldn't find": a live web lookup for the real wine
    // this garbled name most plausibly is. Only a web-confirmed wine is tried,
    // and its intel still has to pass the same identity gate.
    if (allowResolve) {
      const found = await resolveWine(wine);
      if (found) {
        const resolved: WineDetailsComplete = {
          ...wineIn,
          producer: found.producer,
          wineName: found.wineName,
          region: found.region ?? wineIn.region,
          grape: wineIn.grape ?? found.grape,
          style: wineIn.style ?? found.style,
        };
        const again = await generateWineIntel(resolved, currency, false);
        return { ...again, resolvedIdentity: { producer: found.producer, wineName: found.wineName, region: found.region } };
      }
    }
    throw new WineNotFoundError();
  }
  // Prefer this session's live WS score; else fall back to the permanent facts
  // score so a re-open stays accurate even after the 30-day price cache expired.
  const wsScore = wsMatched ? pricing.criticScore : (facts?.criticScore ?? null);

  // Headline value: real WS market average (already in the user's currency)
  // when matched, else Claude's estimate.
  const useWs = wsMatched && pricing.averageMarketPrice != null;
  // Critic score: prefer Wine-Searcher's real aggregated ws-score directly (we
  // pay for it — surface it, don't just anchor Claude to it). Fall back to
  // Claude's estimated consensus only when WS has no score for this wine.
  const useWsScore = wsScore != null;
  return {
    ...intel,
    criticScore: useWsScore ? wsScore : intel.criticScore,
    // A real WS aggregated score is authoritative — no "why it's missing" note.
    criticScoreNote: useWsScore ? null : (intel.criticScoreNote ?? null),
    estimatedValue: useWs ? pricing.averageMarketPrice : intel.estimatedValue,
    estimatedValueLow: useWs ? pricing.minPrice : (intel.estimatedValueLow ?? null),
    estimatedValueHigh: useWs ? pricing.maxPrice : (intel.estimatedValueHigh ?? null),
    // Resolved region: the (Bordeaux-filled) input region, else Claude's region on
    // the intel, else the permanent WS facts — so a region-less wine can be
    // classified by "Update all".
    region: (wine.region ?? '').trim() || (intel as { region?: string | null }).region || facts?.region || null,
    grapeVariety: intel.grapeVariety ?? pricing.grape ?? facts?.grape ?? null,
    valueSource: useWs ? 'wine-searcher' : 'vinster',
    // Real Wine-Searcher market data is high-confidence; otherwise carry Claude's
    // own confidence so the card can flag a shaky (rare/no-market-data) estimate.
    valueConfidence: useWs ? 'high' : (intel.valueConfidence ?? null),
    // Verified = Wine-Searcher found a real record. When false, the score/value
    // are Vinster estimates (labelled as such) and disambiguation is offered.
    verified: wsMatched,
    // Canonical identity anchor — only when Wine-Searcher actually matched.
    wsWineId: wsMatched ? (pricing.wsWineId ?? null) : null,
    wsWineName: wsMatched ? (pricing.wsWineName ?? null) : null,
    // 'all-vintage' when the shown price is the fallback across all vintages
    // (exact vintage had no WS listing); 'vintage' for an exact match; null
    // when the value is a Vinster estimate. Labels the intel card honestly.
    priceScope: useWs ? (pricing.priceScope ?? 'vintage') : null,
  };
}
