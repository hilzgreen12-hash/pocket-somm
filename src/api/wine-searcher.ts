import { supabase } from './supabase';
import type { PricingData } from '../types/wine';

/**
 * Fetch market pricing via the Supabase Edge Function proxy.
 * The Wine-Searcher API key lives in the Edge Function — never in the mobile bundle.
 */
export async function fetchWinePrice(
  wineName: string,
  vintage: number | null,
  currency?: string
): Promise<PricingData> {
  const { data, error } = await supabase.functions.invoke('wine-searcher-proxy', {
    body: { wineName, vintage, currency },
  });
  if (error) throw new Error(`Wine-Searcher proxy error: ${error.message}`);
  return data as PricingData;
}
