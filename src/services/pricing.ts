import { fetchWinePrice } from '../api/wine-searcher';
import { getWineIntelligence } from '../api/label';
import type { PricingData, WineDetailsComplete, WineIntelligence } from '../types/wine';

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
    tastingNotes: intel.tastingNotes ?? null,
  };
}

// Full Wine Intel for the single-wine flows (Generate Wine Intel, add-to-cellar,
// stats batch, review estimate). Same Wine-Searcher-first logic as valueWine,
// but returns the complete WineIntelligence the intel card + add payload consume
// (vintage/rarity assessments, drinking window, per-critic scores, etc.), with
// the real WS market price + WS-anchored score + grape gap-fill merged in.
// fetchPricing already returns prices in the user's currency (proxy converts).
export async function generateWineIntel(
  wine: WineDetailsComplete,
  currency: string = 'GBP',
): Promise<WineIntelligence> {
  const queryName = [wine.producer, wine.wineName].filter(Boolean).join(' ').trim() || (wine.wineName ?? '');
  const vintageNum = wine.vintage && wine.vintage !== 'NV' ? Number(wine.vintage) : null;

  const pricing = await fetchPricing(queryName, Number.isFinite(vintageNum) ? vintageNum : null, currency);
  const wsMatched = pricing.source === 'wine-searcher' && pricing.matched !== false;
  const wsScore = wsMatched ? pricing.criticScore : null;

  // Claude fills the rich fields; wsScore anchors its critic score to WS.
  const intel = await getWineIntelligence(wine, currency, wsScore);

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
    grapeVariety: intel.grapeVariety ?? pricing.grape ?? null,
    valueSource: useWs ? 'wine-searcher' : 'vinster',
  };
}
