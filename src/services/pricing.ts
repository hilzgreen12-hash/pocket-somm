import { fetchWinePrice } from '../api/wine-searcher';
import type { PricingData } from '../types/wine';

export async function fetchPricing(
  wineName: string,
  vintage: number | null
): Promise<PricingData> {
  try {
    return await fetchWinePrice(wineName, vintage);
  } catch {
    return {
      averageMarketPrice: null,
      minPrice: null,
      maxPrice: null,
      currency: 'GBP',
      criticScore: null,
      source: 'unavailable',
    };
  }
}
