// Vinster's own wine database, filled in by Wine Intel lookups.
//
// - wines_catalog: a wine Vinster identified that isn't in the catalogue yet is
//   added (source 'scan'). Marked 'verified' when Wine-Searcher also has this
//   vintage, otherwise 'plausible' — the same scale the catalogue clean-up uses.
// - wine_vintage_facts: that vintage's critic score and drinking window.
//
// Only ever called for wines that passed the identity gate. Every write is
// best-effort: a database problem must never break the card the user is waiting for.
import { createClient } from 'npm:@supabase/supabase-js';

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

// Same normalisation as the catalogue's search_key (seed-catalog, resolve-wine).
function norm(s: string): string {
  return (s ?? '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function catalogKey(producer: string, wineName: string | null): string {
  return wineName ? `${norm(producer)}|${norm(wineName)}` : norm(producer);
}

// A vintage as stored: 'NV' or a 4-digit year; anything else isn't recorded.
export function vintageKey(v: unknown): string | null {
  const s = String(v ?? '').trim();
  if (/^(nv|non[\s-]?vintage)$/i.test(s)) return 'NV';
  return /^\d{4}$/.test(s) ? s : null;
}

export interface VintageFacts {
  critic_score: number | null;
  score_source: 'wine-searcher' | 'vinster' | null;
  drink_from: number | null;
  drink_to: number | null;
  lookups: number;
}

export async function readVintageFacts(key: string, vintage: string): Promise<VintageFacts | null> {
  try {
    const { data } = await admin
      .from('wine_vintage_facts')
      .select('critic_score, score_source, drink_from, drink_to, lookups')
      .eq('search_key', key).eq('vintage', vintage)
      .maybeSingle();
    return (data as VintageFacts | null) ?? null;
  } catch {
    return null;
  }
}

const int = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) ? Math.round(n) : null);

export async function recordIdentifiedWine(w: {
  producer: string;
  wineName: string | null;
  region: string | null;
  grape: string | null;
  style: string | null;
  vintage: string | null;
  criticScore: number | null;
  scoreSource: 'wine-searcher' | 'vinster';
  drinkFrom: number | null;
  drinkTo: number | null;
  previous: VintageFacts | null;  // what was stored before this lookup
}): Promise<void> {
  const key = catalogKey(w.producer, w.wineName);
  if (!key) return;
  const now = new Date().toISOString();
  const fromWs = w.scoreSource === 'wine-searcher';

  // 1. The wine itself — added if new; an existing row is left as it is.
  try {
    await admin.from('wines_catalog').upsert({
      producer: w.producer,
      wine_name: w.wineName,
      region: w.region,
      grape: w.grape,
      style: w.style,
      search_key: key,
      display: [w.producer, w.wineName].filter(Boolean).join(' '),
      source: 'scan',
      verification_status: fromWs ? 'verified' : 'plausible',
      verified_source: fromWs ? 'wine-searcher' : 'llm-plausible',
      verified_at: now,
      verification_notes: 'added from a Wine Intel lookup',
    }, { onConflict: 'search_key', ignoreDuplicates: true });
  } catch (e) {
    console.error('vintageFacts: catalogue insert failed', e instanceof Error ? e.message : e);
  }

  // 2. This vintage's score and window. A Wine-Searcher score already on record
  //    is kept rather than replaced by an estimate.
  if (!w.vintage) return;
  const keepWs = w.previous?.score_source === 'wine-searcher' && !fromWs;
  const score = keepWs ? w.previous!.critic_score : int(w.criticScore);
  const from = int(w.drinkFrom);
  const to = int(w.drinkTo);
  try {
    const { error } = await admin.from('wine_vintage_facts').upsert({
      search_key: key,
      vintage: w.vintage,
      producer: w.producer,
      wine_name: w.wineName,
      critic_score: score != null && score >= 50 && score <= 100 ? score : null,
      score_source: score == null ? null : keepWs ? 'wine-searcher' : w.scoreSource,
      drink_from: from != null && from >= 1800 ? from : null,
      drink_to: to != null && to >= 1800 ? to : null,
      lookups: (w.previous?.lookups ?? 0) + 1,
      updated_at: now,
    }, { onConflict: 'search_key,vintage' });
    if (error) console.error('vintageFacts: vintage upsert failed', error.message);
  } catch (e) {
    console.error('vintageFacts: vintage upsert failed', e instanceof Error ? e.message : e);
  }
}
