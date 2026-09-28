import { supabase } from './supabase';

// The permanent Wine-Searcher facts captured by the proxy on a match (region,
// grape, critic score — the parts that don't change, unlike price). Reading these
// grounds Wine Intel without a live WS call. See migration 110 + the proxy's
// wine_facts upsert. Public-read; grows as real lookups happen.
export interface WineFacts {
  region: string | null;
  grape: string | null;
  criticScore: number | null;
}

// Key mirrors the wine-searcher-proxy's pricing_cache / wine_facts key EXACTLY:
// the query name with any embedded 4-digit vintage stripped, whitespace collapsed,
// then "_<vintage|NV>". Must stay in sync with the proxy or lookups miss.
function wineFactsKey(queryName: string, vintage: number | null): string {
  const scrubbed = (queryName ?? '')
    .replace(/\b(?:19|20)\d{2}\b/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return `${scrubbed}_${vintage ?? 'NV'}`;
}

// Best-effort read of the permanent facts for a wine. Returns null on any miss or
// error — callers fall back to the live WS + Claude path unchanged.
export async function fetchWineFacts(queryName: string, vintage: number | null): Promise<WineFacts | null> {
  try {
    const { data, error } = await supabase
      .from('wine_facts')
      .select('region, grape, critic_score')
      .eq('wine_key', wineFactsKey(queryName, vintage))
      .maybeSingle();
    if (error || !data) return null;
    return {
      region: (data.region as string) ?? null,
      grape: (data.grape as string) ?? null,
      criticScore: (data.critic_score as number) ?? null,
    };
  } catch {
    return null;
  }
}
