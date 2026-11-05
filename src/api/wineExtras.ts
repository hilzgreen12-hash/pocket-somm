import { lookupWineName } from '../utils/wineIdentity';
import { invokeResilient } from './invokeResilient';
import type { CellarWine, WineServingSuggestion, WineMarketVintageNote } from '../types/wine';

// Identity payload shared by the two on-demand wine-card generators.
function identity(w: CellarWine) {
  return {
    producer: w.producer ?? '',
    wineName: lookupWineName(w.producer, w.wine_name, w.region),
    region: w.region ?? '',
    vintage: w.vintage ?? '',
    grape: w.grape_variety ?? '',
    style: w.style ?? '',
  };
}

// Generate "how to serve this wine" on demand (temperature / decant / glassware
// + a wine to enjoy before and after). Caller caches the result on the wine.
// decantTime: the user's own words for how long they have (Ask Vinster), so
// the decanting advice fits.
export async function generateServingSuggestion(w: CellarWine, decantTime?: string): Promise<WineServingSuggestion> {
  const data = await invokeResilient('wine-serving-suggestion', { ...identity(w), ...(decantTime ? { decantTime } : {}) }) as WineServingSuggestion & { error?: string };
  if (data?.error) throw new Error(data.error);
  return data;
}

// "Wider market" for the Serve tab: three styles to buy for before/after this
// wine (each with a reason and price range), when the cellar has nothing fit.
export type MarketStyle = { style: string; reason: string; priceRange: string };
export async function suggestMarketStyles(w: CellarWine, slot: 'before' | 'after', suggested: string, currency: string): Promise<MarketStyle[]> {
  const data = await invokeResilient('wine-serving-suggestion', { ...identity(w), mode: 'market', slot, suggested, currency }) as { styles?: MarketStyle[]; error?: string };
  if (data?.error) throw new Error(data.error);
  return data?.styles ?? [];
}

// Generate Vinster's Market & Vintage Comparison on demand. Returns null when
// the server's recognition gate says the model doesn't genuinely know this wine
// (identified !== true / no text) — the caller shows an honest line instead.
export async function generateMarketVintage(w: CellarWine, currency?: string | null): Promise<WineMarketVintageNote | null> {
  const data = await invokeResilient('wine-market-vintage', { ...identity(w), currency: currency ?? 'GBP' }) as
    { vintage?: string | null; market?: string | null; identified?: boolean; error?: string };
  if (data?.error) throw new Error(data.error);
  if (data?.identified === false || (!data?.vintage && !data?.market)) return null;
  return { vintage: data.vintage ?? undefined, market: data.market ?? undefined };
}

// Vinster's rarity assessment (wine card Market tab). Null when the recognition
// gate says Vinster doesn't genuinely know this wine.
export type WineRarity = { level: number; label: string; text: string };
export async function generateRarity(w: CellarWine): Promise<WineRarity | null> {
  const data = await invokeResilient('wine-market-vintage', { ...identity(w), mode: 'rarity' }) as
    { identified?: boolean; level?: number | null; label?: string | null; text?: string | null; error?: string };
  if (data?.error) throw new Error(data.error);
  if (data?.identified !== true || !data.level || !data.text) return null;
  return { level: data.level, label: data.label ?? '', text: data.text };
}
