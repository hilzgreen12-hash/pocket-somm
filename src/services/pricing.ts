import { fetchWinePrice } from '../api/wine-searcher';
import type { PricingData } from '../types/wine';

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
