import { supabase } from './supabase';

// The permanent Wine-Searcher facts captured by the proxy on a match (region,
// grape, critic score — the parts that don't change, unlike price). Reading these
// grounds Wine Intel without a live WS call. See migration 110 + the proxy's
// wine_facts upsert. Public-read; grows as real lookups happen.
interface WineFacts {
  region: string | null;
  grape: string | null;
  criticScore: number | null;
}

// Keys mirror the wine-searcher-proxy's wine_facts keys EXACTLY. The query name
// has any embedded 4-digit vintage stripped and whitespace collapsed (the proxy's
// `wineName`), then:
//   - newKey: accents removed + lower case (the proxy's cacheName → asWrittenKey)
//   - legacyKey: original casing/accents — rows saved before keys were normalised
// Both end "_<vintage|NV>". Must stay in sync with the proxy or lookups miss.
function wineFactsKeys(queryName: string, vintage: number | null): { newKey: string; legacyKey: string } {
  const wineName = (queryName ?? '')
    .replace(/\b(?:19|20)\d{2}\b/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  const normalised = wineName
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
  const v = vintage ?? 'NV';
  return { newKey: `${normalised}_${v}`, legacyKey: `${wineName}_${v}` };
}

// Best-effort read of the permanent facts for a wine. Returns null on any miss or
// error — callers fall back to the live WS + Claude path unchanged. Reads both the
// normalised key and the legacy as-written key, preferring the normalised row.
export async function fetchWineFacts(queryName: string, vintage: number | null): Promise<WineFacts | null> {
  try {
    const { newKey, legacyKey } = wineFactsKeys(queryName, vintage);
    const { data, error } = await supabase
      .from('wine_facts')
      .select('wine_key, region, grape, critic_score')
      .in('wine_key', [...new Set([newKey, legacyKey])]);
    if (error || !data || data.length === 0) return null;
    const row = data.find((r) => r.wine_key === newKey) ?? data[0];
    return {
      region: (row.region as string) ?? null,
      grape: (row.grape as string) ?? null,
      criticScore: (row.critic_score as number) ?? null,
    };
  } catch {
    return null;
  }
}
