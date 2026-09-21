import { supabase } from '../api/supabase';

// One-off backfill that fills the grape variety on reviews that were saved
// without one — chiefly the thousands imported from Vivino (which exports colour,
// not grape). Grapes are resolved in bulk by the `resolve-grapes` edge function
// (many wines per AI call), then written back per row.

const RESOLVE_CHUNK = 60;     // wines per AI call (matches the edge fn cap)
const UPDATE_CONCURRENCY = 10; // parallel row updates

interface GrapelessRow { id: string; producer: string | null; wine_name: string | null; region: string | null; vintage: string | null }

// Exact count of the user's reviews still missing a grape (bypasses pagination).
export async function countGrapelessReviews(userId: string): Promise<number> {
  const { count } = await supabase
    .from('chosen_wines')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('grape', null);
  return count ?? 0;
}

async function fetchGrapelessReviews(userId: string): Promise<GrapelessRow[]> {
  const PAGE = 1000;
  const out: GrapelessRow[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('chosen_wines')
      .select('id, producer, wine_name, region, vintage')
      .eq('user_id', userId)
      .is('grape', null)
      .range(from, from + PAGE - 1);
    if (error) throw error;
    const batch = (data ?? []) as GrapelessRow[];
    out.push(...batch);
    if (batch.length < PAGE) break;
  }
  return out;
}

// Fill every grape-less review. onProgress(done, total) fires after each AI chunk
// so the caller can show a progress bar. Returns how many grapes were filled.
export async function backfillMissingGrapes(
  userId: string,
  onProgress?: (done: number, total: number) => void,
): Promise<{ filled: number; total: number }> {
  const rows = await fetchGrapelessReviews(userId);
  const total = rows.length;
  let done = 0;
  let filled = 0;

  for (let i = 0; i < rows.length; i += RESOLVE_CHUNK) {
    const chunk = rows.slice(i, i + RESOLVE_CHUNK);
    const wines = chunk.map((r) => ({ producer: r.producer, wineName: r.wine_name, region: r.region, vintage: r.vintage }));
    let grapes: (string | null)[] = [];
    try {
      const { data, error } = await supabase.functions.invoke('resolve-grapes', { body: { wines } });
      if (!error && data && Array.isArray((data as any).grapes)) grapes = (data as any).grapes;
    } catch { grapes = []; }

    // Persist only the rows we actually resolved, in small parallel batches.
    const updates = chunk
      .map((r, j) => ({ id: r.id, grape: grapes[j] ?? null }))
      .filter((u): u is { id: string; grape: string } => !!u.grape);
    for (let k = 0; k < updates.length; k += UPDATE_CONCURRENCY) {
      const slice = updates.slice(k, k + UPDATE_CONCURRENCY);
      await Promise.all(slice.map((u) =>
        supabase.from('chosen_wines').update({ grape: u.grape }).eq('id', u.id)
          .then(({ error }) => { if (!error) filled++; }, () => { /* skip a failed row */ }),
      ));
    }

    done += chunk.length;
    onProgress?.(done, total);
  }

  return { filled, total };
}
