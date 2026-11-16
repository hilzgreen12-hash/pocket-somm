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

// Same normalisation as the catalogue's own key (public._catalog_merge_key,
// mig 102, which a trigger applies to every row): accents and punctuation
// dropped, lowercase, single spaces.
function norm(s: string): string {
  return (s ?? '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// The catalogue's search_key for a wine: "producer wine name", normalised.
export function catalogKey(producer: string, wineName: string | null): string {
  return norm(`${producer} ${wineName ?? ''}`);
}

// Common abbreviations, expanded so "GG" meets "Grosses Gewächs".
const EXPAND: Record<string, string[]> = {
  gg: ['grosses', 'gewachs'], '1er': ['premier'], ler: ['premier'], st: ['saint'], ste: ['sainte'],
};
// Words that make a DIFFERENT bottling — never ignored when matching names.
const DISTINGUISHING = new Set([
  'kabinett', 'spatlese', 'auslese', 'beerenauslese', 'trockenbeerenauslese', 'eiswein', 'trocken',
  'feinherb', 'halbtrocken', 'reserve', 'reserva', 'riserva', 'gran', 'grand', 'grande', 'cru',
  'premier', 'blanc', 'rouge', 'rosso', 'bianco', 'rose', 'brut', 'demi', 'sec', 'doux', 'extra',
  'vieilles', 'vignes', 'old', 'vines', 'grosses', 'gewachs', 'late', 'harvest', 'selection',
  'superiore', 'classico', 'single', 'vineyard', 'estate', 'second', 'deuxieme',
]);

function tokens(s: string | null): Set<string> {
  const out = new Set<string>();
  for (const t of norm((s ?? '').replace(/ß/g, 'ss')).split(' ')) {
    if (!t) continue;
    for (const x of EXPAND[t] ?? [t]) out.add(x);
  }
  return out;
}

// The same wine under a slightly different name: one name's words all appear
// in the other, and the only extra word is a place name rather than one that
// marks a different bottling (so "Hermannshöhle Riesling GG" matches
// "Niederhäuser Hermannshöhle Riesling Großes Gewächs", but never "… Spätlese").
function sameWineName(a: string | null, b: string | null): boolean {
  const A = tokens(a);
  const B = tokens(b);
  if (!A.size || !B.size) return A.size === B.size;
  const [small, big] = A.size <= B.size ? [A, B] : [B, A];
  for (const t of small) if (!big.has(t)) return false;
  const extra = [...big].filter((t) => !small.has(t));
  return extra.length <= 1 && extra.every((t) => !DISTINGUISHING.has(t));
}

// The catalogue's own key for this wine: an exact match, else the same wine
// listed under a slightly different name by the same producer, else this
// wine's new key. Keeps one catalogue row (and one vintage record) per wine.
export async function resolveCatalogKey(producer: string, wineName: string | null): Promise<{ key: string; exists: boolean }> {
  const key = catalogKey(producer, wineName);
  const producerKey = norm(producer);
  if (!producerKey) return { key, exists: false };
  try {
    // Every catalogue key for this producer starts with the producer's name.
    const { data } = await admin
      .from('wines_catalog')
      .select('search_key, producer, wine_name')
      .like('search_key', `${producerKey}%`)
      .neq('verification_status', 'implausible')
      .limit(500);
    const rows = ((data ?? []) as { search_key: string; producer: string; wine_name: string | null }[])
      .filter((r) => norm(r.producer) === producerKey);
    if (rows.some((r) => r.search_key === key)) return { key, exists: true };
    if (!wineName) return { key, exists: false };
    const match = rows
      .filter((r) => r.wine_name && sameWineName(wineName, r.wine_name))
      .sort((x, y) => x.search_key.length - y.search_key.length)[0];
    return match ? { key: match.search_key, exists: true } : { key, exists: false };
  } catch {
    return { key, exists: false };
  }
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
}): Promise<void> {
  if (!catalogKey(w.producer, w.wineName)) return;
  const { key, exists } = await resolveCatalogKey(w.producer, w.wineName);
  const previous = w.vintage ? await readVintageFacts(key, w.vintage) : null;
  const now = new Date().toISOString();
  const fromWs = w.scoreSource === 'wine-searcher';

  // 1. The wine itself — added only if the catalogue doesn't already have it
  //    (under this name or a near-identical one); existing rows are left alone.
  if (!exists) try {
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
  const keepWs = previous?.score_source === 'wine-searcher' && !fromWs;
  const score = keepWs ? previous!.critic_score : int(w.criticScore);
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
      lookups: (previous?.lookups ?? 0) + 1,
      updated_at: now,
    }, { onConflict: 'search_key,vintage' });
    if (error) console.error('vintageFacts: vintage upsert failed', error.message);
  } catch (e) {
    console.error('vintageFacts: vintage upsert failed', e instanceof Error ? e.message : e);
  }
}
