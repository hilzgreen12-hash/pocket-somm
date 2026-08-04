import { supabase } from '../api/supabase';
import { fetchPricing } from './pricing';

// One-off backfill: stamp the canonical Wine-Searcher id (ws_wine_id) onto
// existing labels, reviews (chosen_wines) and cellar wines that predate
// id-anchoring. Cross-linking between the Label Library, Your Wine Reviews and
// the cellar now matches on ws_wine_id ONLY (the old name fallback is gone), so
// older rows need their id resolved once for those links to reappear.
//
// Runs client-side under the user's session (RLS keeps it to their own rows),
// reusing the deployed wine-searcher-proxy — whose 30-day cache makes wines the
// user has already viewed cost zero API calls. Distinct wine identities are
// resolved once and applied to every row that shares them. Idempotent and
// resumable: it only touches rows still missing an id, so an interrupted run
// simply picks up the remainder next time.

type RawRow = { id: string; producer: string | null; wine_name: string | null; vintage: unknown };
type TableName = 'labels' | 'chosen_wines' | 'cellar_wines';
interface RowRef { table: TableName; id: string }

export interface BackfillResult {
  total: number;       // distinct wine identities examined
  resolved: number;    // identities Wine-Searcher matched to an id
  unresolved: number;  // identities Wine-Searcher couldn't identify
  rowsUpdated: number; // individual rows stamped with an id
}

// The Wine-Searcher query string mirrors services/pricing.ts: producer + name.
function queryName(producer: string | null, wineName: string | null): string {
  return [producer, wineName]
    .map((s) => (s ?? '').trim())
    .filter(Boolean)
    .join(' ')
    .trim();
}

function toVintageNum(v: unknown): number | null {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s || s.toUpperCase() === 'NV') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

// Groups rows that resolve to the same Wine-Searcher query so each identity is
// looked up once, not once per row.
function idKey(producer: string | null, wineName: string | null, vintage: number | null): string {
  return `${queryName(producer, wineName).toLowerCase()}__${vintage ?? 'NV'}`;
}

export async function runWsIdBackfill(
  userId: string,
  opts?: { currency?: string; onProgress?: (done: number, total: number) => void },
): Promise<BackfillResult> {
  const currency = opts?.currency ?? 'GBP';

  // 1) Gather every row still missing an id across the three tables.
  const [labelsRes, chosenRes, cellarRes] = await Promise.all([
    supabase.from('labels').select('id, producer, wine_name, vintage').eq('user_id', userId).is('ws_wine_id', null),
    supabase.from('chosen_wines').select('id, producer, wine_name, vintage').eq('user_id', userId).is('ws_wine_id', null),
    supabase.from('cellar_wines').select('id, producer, wine_name, vintage').eq('user_id', userId).is('ws_wine_id', null),
  ]);

  const groups = new Map<string, { producer: string | null; wineName: string | null; vintage: number | null; rows: RowRef[] }>();
  const collect = (table: TableName, rows: RawRow[] | null) => {
    for (const r of rows ?? []) {
      // Nothing to look up without at least a name — leave it null (unmatchable).
      if (!queryName(r.producer, r.wine_name)) continue;
      const vintage = toVintageNum(r.vintage);
      const key = idKey(r.producer, r.wine_name, vintage);
      let g = groups.get(key);
      if (!g) { g = { producer: r.producer, wineName: r.wine_name, vintage, rows: [] }; groups.set(key, g); }
      g.rows.push({ table, id: r.id });
    }
  };
  collect('labels', labelsRes.data as RawRow[] | null);
  collect('chosen_wines', chosenRes.data as RawRow[] | null);
  collect('cellar_wines', cellarRes.data as RawRow[] | null);

  const total = groups.size;
  let resolved = 0, unresolved = 0, rowsUpdated = 0, done = 0;

  // 2) Resolve each identity, throttled sequentially. Cache hits return
  //    instantly; the small gap only paces genuine upstream API calls.
  for (const g of groups.values()) {
    let wsId: string | null = null;
    let wsName: string | null = null;
    // fetchPricing never throws (it returns an 'unavailable' payload on error).
    const p = await fetchPricing(queryName(g.producer, g.wineName), g.vintage, currency);
    if (p.matched !== false && p.wsWineId) {
      wsId = p.wsWineId;
      wsName = p.wsWineName ?? null;
    }

    if (wsId) {
      resolved++;
      // Stamp every row in this identity, grouped by table. The `is null` guard
      // means a row concurrently stamped elsewhere is never overwritten.
      const byTable = new Map<TableName, string[]>();
      for (const row of g.rows) {
        const ids = byTable.get(row.table) ?? [];
        ids.push(row.id);
        byTable.set(row.table, ids);
      }
      for (const [table, ids] of byTable) {
        const { error } = await supabase
          .from(table)
          .update({ ws_wine_id: wsId, ws_wine_name: wsName })
          .in('id', ids)
          .is('ws_wine_id', null);
        if (!error) rowsUpdated += ids.length;
      }
    } else {
      unresolved++;
    }

    done++;
    opts?.onProgress?.(done, total);
    await new Promise((res) => setTimeout(res, 60));
  }

  return { total, resolved, unresolved, rowsUpdated };
}
