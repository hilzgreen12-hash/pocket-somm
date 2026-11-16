import { invokeResilient } from './invokeResilient';
import type { PricingData } from '../types/wine';

/**
 * Market price and critic score for a wine, via the wine-searcher-proxy edge
 * function (the API key lives there, never in the app).
 *
 * exactOnly: this vintage only — no all-vintage fallback. The per-vintage
 * comparison table uses exact rows only, so the fallback would be wasted.
 *
 * Time-limited (a stalled proxy used to leave "Finding this wine…" spinning)
 * and retried once on a dropped connection only.
 */
export async function fetchWinePrice(
  wineName: string,
  vintage: number | null,
  currency?: string,
  opts?: { exactOnly?: boolean },
): Promise<PricingData> {
  return await invokeResilient(
    'wine-searcher-proxy',
    { wineName, vintage, currency, ...(opts?.exactOnly ? { exactOnly: true } : {}) },
    { timeoutMs: 20_000, retries: 1 },
  ) as PricingData;
}
