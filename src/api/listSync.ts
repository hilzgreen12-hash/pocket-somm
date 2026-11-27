import { supabase } from './supabase';

// Keeping a big list (thousands of reviews or bottles) up to date without
// downloading all of it each time. The app holds its own copy — restored from
// disk at launch (see queryPersistence BIG_KEYS) — and asks only for rows
// changed since that copy's newest change, using a column the database stamps
// on every write. Deleted rows are found by comparing counts, and only then by
// listing ids.

// PostgREST returns at most ~1000 rows a request, so big lists come in pages.
const PAGE = 1000;
// Rows asked for by id per request (keeps the URL short).
const ID_CHUNK = 150;
// Changes are asked for from a little before the newest one held: a write
// stamped just before another but saved just after it can't be missed. Rows
// that come back unchanged are simply skipped.
const OVERLAP_MS = 60_000;

type Row = { id: string };
// A PostgREST select under construction. Kept loose: the list's filter and
// order are applied to whatever builder supabase-js hands back.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Query = any;

export interface ListSpec<T extends Row> {
  table: string;
  // Rows belong to this user id (for a shared cellar, the cellar owner's).
  ownerId: string;
  // The column the database stamps on every write (migrations 149 / 150).
  stamp: keyof T & string;
  // Narrows a query to this list (e.g. live bottles only, not archived ones).
  filter?: (q: Query) => Query;
  // The same test on a row: a changed row that no longer passes has left the list.
  belongs?: (row: T) => boolean;
  // The list's order, as a query and as a comparison; `id` breaks ties in both.
  orderBy: { column: keyof T & string; ascending: boolean };
}

const narrowed = <T extends Row>(spec: ListSpec<T>, q: Query) =>
  (spec.filter ? spec.filter(q) : q).eq('user_id', spec.ownerId);

function sorter<T extends Row>(spec: ListSpec<T>) {
  const { column, ascending } = spec.orderBy;
  return (a: T, b: T) => {
    const av = String(a[column] ?? ''), bv = String(b[column] ?? '');
    const byCol = ascending ? av.localeCompare(bv) : bv.localeCompare(av);
    return byCol || a.id.localeCompare(b.id);
  };
}

async function countRows<T extends Row>(spec: ListSpec<T>): Promise<number> {
  const { count, error } = await narrowed(spec, supabase.from(spec.table).select('id', { count: 'exact', head: true }));
  if (error) throw error;
  return count ?? 0;
}

// Every page at once, rather than one after another.
async function allPages<R>(spec: ListSpec<Row>, columns: string, total: number): Promise<R[]> {
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const results = await Promise.all(Array.from({ length: pages }, (_, i) =>
    narrowed(spec, supabase.from(spec.table).select(columns))
      .order(spec.orderBy.column, { ascending: spec.orderBy.ascending })
      .order('id', { ascending: true })
      .range(i * PAGE, i * PAGE + PAGE - 1)));
  const out: R[] = [];
  for (const { data, error } of results) {
    if (error) throw error;
    out.push(...((data ?? []) as R[]));
  }
  return out;
}

// The whole list. A row added while the pages loaded can push one into the
// next page twice, so duplicates are dropped.
export async function fetchWholeList<T extends Row>(spec: ListSpec<T>): Promise<T[]> {
  const total = await countRows(spec);
  const rows = await allPages<T>(spec as unknown as ListSpec<Row>, '*', total);
  const seen = new Set<string>();
  return rows.filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true))).sort(sorter(spec));
}

// Bring a held copy up to date. Without a usable copy (first load, or rows
// from before the stamp column existed) it falls back to the whole list. When
// nothing has changed it hands back the same array, so nothing re-renders or
// re-saves.
export async function syncList<T extends Row>(spec: ListSpec<T>, prev: T[] | undefined): Promise<T[]> {
  if (!prev || prev.length === 0) return fetchWholeList(spec);
  // A copy held for another owner (the user switched to a different cellar
  // under the same cache key) is no base for a sync: with equal row counts the
  // old cellar's rows would survive. Start over.
  for (const r of prev) {
    const owner = (r as { user_id?: string | null }).user_id;
    if (owner != null && owner !== spec.ownerId) return fetchWholeList(spec);
  }
  let newest = '';
  for (const r of prev) {
    const s = r[spec.stamp] as unknown as string | null | undefined;
    if (!s) return fetchWholeList(spec);
    if (s > newest) newest = s;
  }
  // The database writes microseconds ("…:05.123456+00:00"), which not every
  // phone's date parser accepts; milliseconds are plenty here.
  const newestMs = Date.parse(newest.replace(/(\.\d{3})\d+/, '$1'));
  const since = Number.isFinite(newestMs) ? new Date(newestMs - OVERLAP_MS).toISOString() : newest;

  // Changed rows are fetched without the list's filter: a row that has left
  // the list (archived, say) has to be seen to be taken out.
  const [changedRes, total] = await Promise.all([
    supabase.from(spec.table).select('*').eq('user_id', spec.ownerId).gte(spec.stamp, since).limit(PAGE),
    countRows(spec),
  ]);
  if (changedRes.error) throw changedRes.error;
  const changed = (changedRes.data ?? []) as T[];
  // A big batch changed at once (a fresh import): simpler to start over.
  if (changed.length >= PAGE) return fetchWholeList(spec);

  const byId = new Map(prev.map((r) => [r.id, r]));
  let touched = false;
  for (const r of changed) {
    const inList = spec.belongs ? spec.belongs(r) : true;
    const old = byId.get(r.id);
    if (!inList) {
      if (old) { byId.delete(r.id); touched = true; }
      continue;
    }
    if (old && old[spec.stamp] === r[spec.stamp]) continue;
    byId.set(r.id, r);
    touched = true;
  }
  // Counts differ only when rows were deleted (or something was missed): look
  // up which ids the list really holds.
  if (byId.size !== total) {
    const ids = await allPages<Row>(spec as unknown as ListSpec<Row>, 'id', total);
    const live = new Set(ids.map((r) => r.id));
    for (const id of [...byId.keys()]) if (!live.has(id)) { byId.delete(id); touched = true; }
    const missing = ids.map((r) => r.id).filter((id) => !byId.has(id));
    // Many rows missing (the held copy was largely stale): one parallel full
    // fetch beats asking for them 150 at a time, one request after another.
    if (missing.length > 300 || missing.length > total / 2) return fetchWholeList(spec);
    for (let i = 0; i < missing.length; i += ID_CHUNK) {
      const { data, error } = await supabase.from(spec.table).select('*').in('id', missing.slice(i, i + ID_CHUNK));
      if (error) throw error;
      for (const r of (data ?? []) as T[]) byId.set(r.id, r);
      touched = true;
    }
  }
  if (!touched) return prev;
  return [...byId.values()].sort(sorter(spec));
}
