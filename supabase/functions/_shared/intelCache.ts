// Saved Wine Intel results (wine_intel_cache, mig 132).
//
// One result per wine + vintage + currency (+ the style/grape the user pinned
// and the Wine-Searcher score it was anchored to), kept 30 days — prices and
// "ready to drink" status move, so it isn't kept forever. Only identified wines
// are saved; an unrecognised name is always looked at afresh.
import { createClient } from 'npm:@supabase/supabase-js';

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const KEEP_DAYS = 30;

export function intelCacheKey(parts: {
  catalogKey: string; vintage: string | null; currency: string;
  style: string | null; grape: string | null; anchor: string;
}): string {
  const n = (s: string | null) => (s ?? '').trim().toLowerCase();
  return [parts.catalogKey, parts.vintage ?? '-', parts.currency, n(parts.style), n(parts.grape), parts.anchor].join('|');
}

export async function readIntelCache(key: string): Promise<Record<string, unknown> | null> {
  try {
    const since = new Date(Date.now() - KEEP_DAYS * 86_400_000).toISOString();
    const { data } = await admin
      .from('wine_intel_cache')
      .select('result')
      .eq('cache_key', key)
      .gte('created_at', since)
      .maybeSingle();
    return (data?.result as Record<string, unknown> | undefined) ?? null;
  } catch {
    return null;
  }
}

export async function saveIntelCache(key: string, result: unknown): Promise<void> {
  try {
    const { error } = await admin
      .from('wine_intel_cache')
      .upsert({ cache_key: key, result, created_at: new Date().toISOString() }, { onConflict: 'cache_key' });
    if (error) console.error('intelCache: save failed', error.message);
  } catch (e) {
    console.error('intelCache: save failed', e instanceof Error ? e.message : e);
  }
}
