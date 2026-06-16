import { fetchWinePrice } from '../api/wine-searcher';
import { getWineIntelligence } from '../api/label';
import type { PricingData, WineDetailsComplete } from '../types/wine';

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
  tastingNotes: string | null;
}

export async function valueWine(
  wine: WineDetailsComplete,
  currency: string = 'GBP',
): Promise<WineValuation> {
  // Build the Wine-Searcher query from producer + wine name for the best match.
  const queryName = [wine.producer, wine.wineName].filter(Boolean).join(' ').trim() || (wine.wineName ?? '');
  const vintageNum = wine.vintage && wine.vintage !== 'NV' ? Number(wine.vintage) : null;

  const pricing = await fetchPricing(queryName, Number.isFinite(vintageNum) ? vintageNum : null, currency);
  const wsMatched = pricing.source === 'wine-searcher' && pricing.matched !== false;
  const wsScore = wsMatched ? pricing.criticScore : null;

  // Claude fills drinking window, tasting notes, grape, and (anchored) score.
  const intel = await getWineIntelligence(wine, currency, wsScore);

  // Headline value: real WS market average when matched, else Claude estimate.
  const useWs = wsMatched && pricing.averageMarketPrice != null;

  return {
    estimatedValue: useWs ? pricing.averageMarketPrice : intel.estimatedValue,
    estimatedValueLow: useWs ? pricing.minPrice : (intel.estimatedValueLow ?? null),
    estimatedValueHigh: useWs ? pricing.maxPrice : (intel.estimatedValueHigh ?? null),
    currency: useWs ? pricing.currency : currency,
    valueSource: useWs ? 'wine-searcher' : 'vinster',
    criticScore: intel.criticScore,
    criticScoreNote: intel.criticScoreNote ?? null,
    drinkingWindowFrom: intel.drinkingWindowFrom ?? null,
    drinkingWindowTo: intel.drinkingWindowTo ?? null,
    drinkingWindowStatus: intel.drinkingWindowStatus ?? 'unknown',
    grapeVariety: intel.grapeVariety ?? null,
    tastingNotes: intel.tastingNotes ?? null,
  };
}
