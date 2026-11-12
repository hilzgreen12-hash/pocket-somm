import { invokeResilient } from './invokeResilient';
import { fetchPricingWithAlt } from '../services/pricing';
import { wineNameKey, wineQueryName, wineQueryAltName } from '../utils/wineIdentity';

// Compare Wines or Vintages (Home → Search & Discover). Fetches each wine's
// Wine-Searcher score and price, then asks the compare-wines edge function for
// Vinster's side-by-side comparison.

export interface CompareWineInput {
  producer: string;
  wineName: string | null;
  region: string | null;
  grape: string | null;
  vintage: string; // 4-digit year or 'NV'
}

export interface CompareWineResult {
  identified: boolean;
  criticScore: number | null;
  drinkingWindowFrom: number | null;
  drinkingWindowTo: number | null;
  drinkingWindowStatus: 'too_young' | 'approaching' | 'peak' | 'declining' | null;
  estimatedValue: number | null;
  reviews: string | null;
  vintageReport: string | null;
  styleImpact: string | null;
  regionNote?: string | null;
  grapeNote?: string | null;
}

export interface ComparePick { wine: number; reason: string }

export interface Comparison {
  mode: 'vintages' | 'wines';
  currency: string;
  // Wine-Searcher market data, one per input wine (null when not found).
  market: { score: number | null; price: number | null }[];
  wines: CompareWineResult[];
  drinkNow: ComparePick | null;
  layDown: ComparePick | null;
  bestValue: ComparePick | null;
  marketComparison: string | null;
  regionGrapeComparison: string | null;
  insideLine: string | null;
  verdict: string | null;
}

// Same wine (producer + name) in every row → a vintage comparison.
export function compareMode(wines: CompareWineInput[]): 'vintages' | 'wines' {
  const keys = new Set(wines.map((w) => wineNameKey(w.producer, w.wineName)));
  return keys.size === 1 ? 'vintages' : 'wines';
}

export async function runComparison(wines: CompareWineInput[], currency: string): Promise<Comparison> {
  const mode = compareMode(wines);
  const market = await Promise.all(wines.map(async (w) => {
    const vintage = /^\d{4}$/.test(w.vintage) ? Number(w.vintage) : null;
    try {
      const { pricing } = await fetchPricingWithAlt(
        wineQueryName(w.producer, w.wineName),
        wineQueryAltName(w.producer, w.wineName, w.region),
        vintage,
        currency,
      );
      const ok = pricing.source === 'wine-searcher' && pricing.matched !== false;
      // Only an exact-vintage price belongs in a vintage-by-vintage table.
      const exact = ok && pricing.priceScope !== 'all-vintage';
      return { score: ok ? pricing.criticScore ?? null : null, price: exact ? pricing.averageMarketPrice ?? null : null };
    } catch {
      return { score: null, price: null };
    }
  }));
  const data = await invokeResilient('compare-wines', {
    mode,
    currency,
    wines: wines.map((w, i) => ({ ...w, wsScore: market[i].score, wsPrice: market[i].price })),
  }, { timeoutMs: 120000, retries: 1 }) as Omit<Comparison, 'currency' | 'market'> & { error?: string; message?: string };
  if (!data || !Array.isArray(data.wines)) throw new Error(data?.message ?? "Vinster couldn't compare these wines just now. Please try again.");
  return { ...data, currency, market };
}
