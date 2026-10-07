import { invokeResilient } from './invokeResilient';
import type { CellarWine, WineServingSuggestion, WineMarketVintageNote } from '../types/wine';

// Identity payload shared by the two on-demand wine-card generators.
function identity(w: CellarWine) {
  return {
    producer: w.producer ?? '',
    wineName: w.wine_name ?? '',
    region: w.region ?? '',
    vintage: w.vintage ?? '',
    grape: w.grape_variety ?? '',
    style: w.style ?? '',
  };
}

// Generate "how to serve this wine" on demand (temperature / decant / glassware
// + a wine to enjoy before and after). Caller caches the result on the wine.
export async function generateServingSuggestion(w: CellarWine): Promise<WineServingSuggestion> {
  const data = await invokeResilient('wine-serving-suggestion', identity(w)) as WineServingSuggestion & { error?: string };
  if (data?.error) throw new Error(data.error);
  return data;
}

// Generate Vinster's Market & Vintage Comparison on demand.
export async function generateMarketVintage(w: CellarWine, currency?: string | null): Promise<WineMarketVintageNote> {
  const data = await invokeResilient('wine-market-vintage', { ...identity(w), currency: currency ?? 'GBP' }) as WineMarketVintageNote & { error?: string };
  if (data?.error) throw new Error(data.error);
  return data;
}
