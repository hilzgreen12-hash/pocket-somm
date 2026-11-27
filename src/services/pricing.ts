import { fetchWinePrice } from '../api/wine-searcher';
import { recordLookupMiss } from '../api/lookupMisses';
import { getWineIntelligence, resolveWine, type ResolvedWine, type WebResearch } from '../api/label';
import { fetchWineFacts } from '../api/wineFacts';
import { estimateFormatValue } from '../api/wineExtras';
import { isStandardBottle } from '../utils/bottleValue';
import { wineQueryName, wineQueryAltName, looseWineMatch } from '../utils/wineIdentity';
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
// The Wine-Searcher score to anchor Vinster's critic score: this vintage's own
// score, or else the wine's all-vintage average flagged as such (guidance only —
// it's never shown as this vintage's score).
function scoreAnchor(p: PricingData, matched: boolean): [number | null, 'vintage' | 'all-vintage' | undefined] {
  if (!matched) return [null, undefined];
  if (p.criticScore != null) return [p.criticScore, 'vintage'];
  if (p.allVintageScore != null) return [p.allVintageScore, 'all-vintage'];
  return [null, undefined];
}

class WineNotFoundError extends Error {
  constructor() { super("Vinster couldn't find this wine."); this.name = 'WineNotFoundError'; }
}
export function isWineNotFound(e: unknown): boolean {
  return e instanceof Error && e.name === 'WineNotFoundError';
}

// Whether the wine the web lookup found is the one asked about, written another
// way ("Les Filles d'Amàlia Les Prunes" under its estate, Celler del Roure) —
// not a different wine the name was mistaken for.
export function isSameWine(asked: WineDetailsComplete, found: { producer: string; wineName: string | null }): boolean {
  return looseWineMatch(
    { producer: asked.producer, wineName: asked.wineName, vintage: asked.vintage },
    { producer: found.producer, wineName: found.wineName, vintage: asked.vintage },
  );
}

// The asked-for details under the found wine's correct names.
function asResolved(wine: WineDetailsComplete, found: ResolvedWine): WineDetailsComplete {
  return {
    ...wine,
    producer: found.producer,
    wineName: found.wineName,
    region: found.region ?? wine.region,
    grape: wine.grape ?? found.grape,
    style: wine.style ?? found.style,
  };
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
  currency?: string,
  opts?: { exactOnly?: boolean },
): Promise<PricingData> {
  try {
    return await fetchWinePrice(wineName, vintage, currency, opts);
  } catch {
    return {
      matched: false,
      averageMarketPrice: null,
      minPrice: null,
      maxPrice: null,
      currency: currency ?? 'GBP',
      criticScore: null,
      source: 'unavailable',
      down: true,
    } as PricingData;
  }
}

// True when Wine-Searcher couldn't be asked at all (outage, or the lookup
// allowance used up) rather than answering "no listing".
export function isDown(p: PricingData): boolean {
  return !!(p as PricingData & { down?: boolean }).down;
}

// Plain name first; on a clean miss, the appellation fallback (see
// wineQueryAltName). Returns the pricing and the name that matched.
export async function fetchPricingWithAlt(queryName: string, altName: string | null, vintage: number | null, currency: string): Promise<{ pricing: PricingData; name: string }> {
  const first = await fetchPricing(queryName, vintage, currency);
  const matched = first.source === 'wine-searcher' && first.matched !== false;
  if (matched || !altName || isDown(first)) return { pricing: first, name: queryName };
  const alt = await fetchPricing(altName, vintage, currency);
  return alt.source === 'wine-searcher' && alt.matched !== false ? { pricing: alt, name: altName } : { pricing: first, name: queryName };
}

// Before building a card from a label read: does Wine-Searcher know this wine?
// Uses the SAME lookup as the card itself (clean name + appellation fallback),
// so wines like "Penfolds Grange" aren't sent to the confirm step needlessly.
// A Wine-Searcher outage or daily limit counts as "can't check" → true, so the
// card is still built (its own identity gate still applies) rather than every
// scan being pushed to the confirm step.
export async function verifyOnWineSearcher(d: WineDetailsComplete, currency: string): Promise<boolean> {
  const queryName = wineQueryName(d.producer, d.wineName) || (d.wineName ?? '');
  const vintage = d.vintage && d.vintage !== 'NV' && Number.isFinite(Number(d.vintage)) ? Number(d.vintage) : null;
  try {
    const { pricing } = await fetchPricingWithAlt(queryName, wineQueryAltName(d.producer, d.wineName, d.region), vintage, currency);
    if (isDown(pricing)) return true;
    return pricing.source === 'wine-searcher' && pricing.matched !== false;
  } catch {
    return true;
  }
}

// One row of the "Vintage & Market Comparison" table — a single vintage's
// Wine-Searcher critic score and market price (in the user's currency).
export interface VintageComparisonRow {
  vintage: number;
  score: number | null;
  price: number | null;
}

// Build a wine's per-vintage Wine-Searcher table (score + price) through the
// pricing proxy, which caches each (wine, vintage), so a re-open is instant. Only
// EXACT-vintage listings are kept (the all-vintage average fallback is filtered
// out), so every row is real data for that year.
//
// Which years: for a wine with a vintage, the CLOSEST vintages Wine-Searcher
// lists — 1999, 2001, 1998, 2002… around a 2000 — until COMPARISON_NEIGHBOURS
// are found, so the table shows eight vintages with the user's own. A wine
// with no vintage compares the most recent years. Each new (wine, vintage) is
// a paid lookup, so the walk is capped at COMPARISON_LOOKUPS.
const COMPARISON_NEIGHBOURS = 7;
const COMPARISON_LOOKUPS = 16;
const COMPARISON_REACH = 15; // years either side of the vintage

function comparisonYears(scannedVintage: number | null, lastVintage: number): number[] {
  if (scannedVintage == null) {
    return Array.from({ length: COMPARISON_LOOKUPS }, (_, i) => lastVintage - i);
  }
  const years = [scannedVintage];
  for (let d = 1; d <= COMPARISON_REACH; d++) {
    years.push(scannedVintage - d);
    if (scannedVintage + d <= lastVintage) years.push(scannedVintage + d);
  }
  return years;
}

export async function fetchVintageComparison(
  queryName: string,
  currency: string,
  scannedVintage: number | null,
  // Appellation fallback (wineQueryAltName): tried only if the plain name finds
  // no vintages at all.
  altName?: string | null,
): Promise<VintageComparison> {
  const scanned = scannedVintage != null && Number.isFinite(scannedVintage) ? scannedVintage : null;
  const candidates = comparisonYears(scanned, new Date().getFullYear() - 1);
  const rows: VintageComparisonRow[] = [];
  let lookups = 0;
  let unavailable = 0;
  const enough = () => rows.filter((r) => r.vintage !== scanned).length >= (scanned == null ? COMPARISON_NEIGHBOURS + 1 : COMPARISON_NEIGHBOURS);
  // Small batches keep the Wine-Searcher request rate modest and let the walk
  // stop as soon as enough nearby vintages are found.
  const BATCH = 3;
  for (let i = 0; i < candidates.length && lookups < COMPARISON_LOOKUPS && !enough(); i += BATCH) {
    const batch = candidates.slice(i, Math.min(i + BATCH, i + COMPARISON_LOOKUPS - lookups));
    lookups += batch.length;
    const results = await Promise.all(batch.map(async (y) => {
      const p = await fetchPricing(queryName, y, currency, { exactOnly: true });
      if (isDown(p)) unavailable++;
      const exactHit = p.matched !== false && p.priceScope !== 'all-vintage' && (p.averageMarketPrice != null || p.criticScore != null);
      return exactHit ? { vintage: y, score: p.criticScore ?? null, price: p.averageMarketPrice ?? null } : null;
    }));
    for (const r of results) if (r) rows.push(r);
  }
  rows.sort((a, b) => b.vintage - a.vintage);
  // Nothing came back AND most lookups errored (Wine-Searcher down, or its
  // daily lookup limit reached) — that is NOT "no data for this wine". Throw so
  // callers say "try again later" and never save an empty table.
  if (rows.length === 0 && unavailable >= Math.ceil(lookups / 2)) throw new WineSearcherUnavailableError();
  if (rows.length === 0 && altName && altName.toLowerCase() !== queryName.toLowerCase()) return fetchVintageComparison(altName, currency, scannedVintage, null);
  // Some years went unasked (Wine-Searcher down or its daily limit reached), so
  // a short table may just be missing them — callers say so and don't save it.
  return { rows, incomplete: unavailable > 0 && !enough() };
}

export type VintageComparison = { rows: VintageComparisonRow[]; incomplete: boolean };

export const VINTAGES_INCOMPLETE_NOTE = "Wine-Searcher's daily limit was reached, so not every vintage could be checked. Tap Refresh later to complete the table.";

class WineSearcherUnavailableError extends Error {
  constructor() { super("Wine-Searcher isn't responding right now."); this.name = 'WineSearcherUnavailableError'; }
}
export function isWineSearcherUnavailable(e: unknown): boolean {
  return e instanceof Error && e.name === 'WineSearcherUnavailableError';
}

// Combined valuation for the wine card: real Wine-Searcher market data when
// the wine matches, with the Claude estimate as fallback. The critic score is
// always a Vinster score — but anchored to Wine-Searcher's ws-score (the
// "north star") when a match exists, so it's grounded in real data.
interface WineValuation {
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
  // Wine-Searcher couldn't be asked, so the value is a stand-in Vinster estimate.
  wsUnavailable?: boolean;
}

export async function valueWine(
  wine: WineDetailsComplete,
  currency: string = 'GBP',
  // Set on the retry after a web lookup (so it can't loop): what it found.
  research: WebResearch | null = null,
): Promise<WineValuation> {
  // Build the Wine-Searcher query from producer + wine name for the best match.
  const queryName = wineQueryName(wine.producer, wine.wineName) || (wine.wineName ?? '');
  const vintageNum = wine.vintage && wine.vintage !== 'NV' ? Number(wine.vintage) : null;

  const vintageArg = Number.isFinite(vintageNum) ? vintageNum : null;
  const { pricing: first } = await fetchPricingWithAlt(queryName, wineQueryAltName(wine.producer, wine.wineName, wine.region), vintageArg, currency);
  const firstMatched = first.source === 'wine-searcher' && first.matched !== false;

  // Claude fills drinking window, tasting notes, grape, (anchored) score, and a
  // canonical Wine-Searcher search name we fall back to when the raw query misses.
  const intel = await getWineIntelligence(wine, currency, ...scoreAnchor(first, firstMatched), research);

  // Retry Wine-Searcher with Claude's canonical name on a miss (cult-producer gap).
  const pricing = await resolveWsPricing(first, queryName, intel.wsSearchName, vintageArg, currency);
  const wsMatched = pricing.source === 'wine-searcher' && pricing.matched !== false;
  const wsScore = wsMatched ? pricing.criticScore : null;
  // Unrecognised by Vinster and no Wine-Searcher listing: Vinster's own web
  // research is the last resort. Only the same wine, confirmed by a page the
  // search returned, is valued — from what those pages show.
  if (intel.identified === false && !wsMatched) {
    const found = research ? null : await resolveWine(wine);
    if (found && isSameWine(wine, found)) return valueWine(asResolved(wine, found), currency, found.research);
    throw new WineNotFoundError();
  }

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
    wsUnavailable: !wsMatched && isDown(pricing),
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
  // Internal: set on the retry after a web lookup (so it can't loop) — what it found.
  research: WebResearch | null = null,
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
  // What Vinster's score was anchored to (see scoreAnchor) — told to the user.
  let anchorScope: 'vintage' | 'all-vintage' | undefined;
  // Set when nothing recognised the wine: the card shows only the details given.
  let labelOnly = false;
  if (facts?.criticScore != null) {
    // Fast path: we already hold a real WS score to anchor Claude, so fetch the
    // (volatile) price and generate intel IN PARALLEL rather than waiting for WS.
    [first, intel] = await Promise.all([
      fetchPricingWithAlt(queryName, wineQueryAltName(wine.producer, wine.wineName, wine.region), vintageArg, currency).then((r) => r.pricing),
      getWineIntelligence(wine, currency, facts.criticScore, 'vintage', research),
    ]);
    anchorScope = 'vintage';
  } else {
    // No permanent score yet → keep the original sequence so Claude is still
    // anchored to THIS session's WS score when there is one (no regression).
    first = await fetchPricingWithAlt(queryName, wineQueryAltName(wine.producer, wine.wineName, wine.region), vintageArg, currency).then((r) => r.pricing);
    const firstMatched = first.source === 'wine-searcher' && first.matched !== false;
    // Claude fills the rich fields; wsScore anchors its critic score to WS. It also
    // returns wsSearchName — the canonical WS query we retry with on a miss.
    const anchor = scoreAnchor(first, firstMatched);
    anchorScope = anchor[1];
    intel = await getWineIntelligence(wine, currency, ...anchor, research);
  }

  // Retry Wine-Searcher with Claude's canonical name on a miss (cult-producer gap).
  const pricing = await resolveWsPricing(first, queryName, intel.wsSearchName, vintageArg, currency);
  const wsMatched = pricing.source === 'wine-searcher' && pricing.matched !== false;
  // IDENTITY GATE: Vinster doesn't recognise the wine and Wine-Searcher has no
  // listing → it may not exist (misheard / misread). Never build a card for it.
  // (A prior permanent WS facts record counts as a real listing.)
  if (intel.identified === false && !wsMatched && facts?.criticScore == null) {
    // Last resort before "couldn't find": a live web lookup for the real wine
    // this (possibly garbled) name is. Only a web-confirmed wine is tried, its
    // intel grounded in what the pages show, and it still has to pass the same
    // identity gate.
    if (!research) {
      // Started only now it's needed (a paid web search): when Claude doesn't
      // recognise the wine AND both Wine-Searcher name attempts missed.
      const found = await resolveWine(wine);
      if (found) {
        const again = await generateWineIntel(asResolved(wineIn, found), currency, found.research);
        return { ...again, resolvedIdentity: { producer: found.producer, wineName: found.wineName, region: found.region } };
      }
    }
    // Scanned, typed or spoken, every wine gets its card — never "couldn't
    // find". Nothing above recognised this one, so the card carries the
    // details given and nothing invented: the server has already left every
    // estimate (score, value, window, notes) empty for an unrecognised wine.
    labelOnly = true;
    recordLookupMiss(wine, isDown(pricing));
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
    // Where the score comes from, explained when the user taps it: critics'
    // scores for THIS vintage, Vinster's score guided by the average across the
    // wine's vintages, or Vinster's own estimate.
    criticScoreBasis: useWsScore ? 'vintage' : anchorScope === 'all-vintage' ? 'all-vintage' : 'vinster',
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
    // Wine-Searcher couldn't be asked (outage, or the lookup allowance is used
    // up) — not the same as "no listing", so the card says so and doesn't ask
    // the user to re-confirm a wine that may well be read correctly.
    wsUnavailable: !wsMatched && isDown(pricing),
    // Canonical identity anchor — only when Wine-Searcher actually matched.
    wsWineId: wsMatched ? (pricing.wsWineId ?? null) : null,
    wsWineName: wsMatched ? (pricing.wsWineName ?? null) : null,
    // 'all-vintage' when the shown price is the fallback across all vintages
    // (exact vintage had no WS listing); 'vintage' for an exact match; null
    // when the value is a Vinster estimate. Labels the intel card honestly.
    priceScope: useWs ? (pricing.priceScope ?? 'vintage') : null,
    labelOnly,
  };
}

// The value fields a lookup carries, as valueWine and generateWineIntel return them.
type ValueFields = {
  estimatedValue: number | null;
  estimatedValueLow?: number | null;
  estimatedValueHigh?: number | null;
  currency?: string;
  valueSource?: 'wine-searcher' | 'vinster' | null;
  valueConfidence?: 'high' | 'medium' | 'low' | null;
  priceScope?: 'vintage' | 'all-vintage' | null;
};

// A cellar wine's value is for ONE of its bottles at its own size. Lookups price
// a 75cl bottle, so for any other size that price becomes the reference for
// Vinster's estimate of the format — never multiplied, since rarity sets what
// magnums and large formats sell for. No estimate → no value, never a scaled one.
export async function forBottleSize<T extends ValueFields>(
  lookup: T,
  wine: { producer?: string | null; wineName?: string | null; region?: string | null; vintage?: string | null; grape?: string | null },
  bottleSizeMl: number | null | undefined,
  currency: string,
): Promise<T> {
  if (isStandardBottle(bottleSizeMl)) return lookup;
  const reference = lookup.estimatedValue != null
    ? { value: lookup.estimatedValue, low: lookup.estimatedValueLow ?? null, high: lookup.estimatedValueHigh ?? null, source: lookup.valueSource ?? 'vinster' }
    : null;
  const sized = await estimateFormatValue(wine, bottleSizeMl as number, reference, lookup.currency ?? currency).catch(() => null);
  return {
    ...lookup,
    estimatedValue: sized?.value ?? null,
    estimatedValueLow: sized?.low ?? null,
    estimatedValueHigh: sized?.high ?? null,
    currency: lookup.currency ?? currency,
    valueSource: sized ? 'vinster' : null,
    valueConfidence: sized?.confidence ?? null,
    priceScope: null,
  };
}
