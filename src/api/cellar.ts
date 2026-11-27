import { supabase } from './supabase';
import { syncList, type ListSpec } from './listSync';
import { cellarOwner, assertCanEditCellar, canEditCellar, VIEW_ONLY_MESSAGE } from './cellarContext';
import { selectAllPages, chunkIds } from './paging';
import type { CellarWine } from '../types/wine';
import { findSameCellarWine, type WineLike } from '../utils/wineMatch';

// Every live wine in the selected cellar, newest first, and the archive,
// newest archived first. A cellar can run to thousands of bottles (an import), so the app keeps its
// own copy of the live list and the archive and syncs only what changed (see
// listSync). Shared cellar: the rows are the cellar owner's.
const liveList = (userId: string): ListSpec<CellarWine> => ({
  table: 'cellar_wines',
  ownerId: cellarOwner(userId),
  stamp: 'changed_at',
  filter: (q) => q.is('archived_at', null),
  belongs: (w) => w.archived_at == null,
  orderBy: { column: 'created_at', ascending: false },
});
const archiveList = (userId: string): ListSpec<CellarWine> => ({
  table: 'cellar_wines',
  ownerId: cellarOwner(userId),
  stamp: 'changed_at',
  filter: (q) => q.not('archived_at', 'is', null),
  belongs: (w) => w.archived_at != null,
  orderBy: { column: 'archived_at', ascending: false },
});

// `prev`: the copy already held, brought up to date rather than re-downloaded.
export async function getCellarWines(userId: string, prev?: CellarWine[]): Promise<CellarWine[]> {
  return syncList(liveList(userId), prev);
}

// ----- Removal events (cellar_wine_removals) -----

interface CellarWineRemoval {
  id: string;
  user_id: string;
  cellar_wine_id: string;
  removed_at: string;
  count: number;
  note: string | null;
  created_at: string;
}

export async function addCellarWineRemoval(input: { cellarWineId: string; removedAt: string; count: number; note?: string | null }): Promise<CellarWineRemoval> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sign in required');
  assertCanEditCellar();
  const { data, error } = await supabase
    .from('cellar_wine_removals')
    .insert({
      // Shared cellar: removal history belongs to the cellar (owner's id).
      user_id: cellarOwner(user.id),
      cellar_wine_id: input.cellarWineId,
      removed_at: input.removedAt,
      count: input.count,
      note: input.note ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as CellarWineRemoval;
}

// Take back the removal log of `count` bottles that have come back from the
// archive, archived on `day` (YYYY-MM-DD). The entry was written against the
// row the bottles left — the live row after a partial archive, the archived row
// itself after a whole one — so every row of the same wine (identical producer,
// name, vintage and size, as an archive copy is) is searched, plus `alsoIds`.
// The entry for exactly those bottles (that day, that count) goes. Failing that
// (archives merged, or the date edited since), the most recent entries go until
// `count` bottles are accounted for, the last one trimmed if it held more.
export async function takeBackCellarWineRemovals(wine: CellarWine, alsoIds: string[], day: string, count: number): Promise<void> {
  let rowsQuery = supabase.from('cellar_wines').select('id').eq('user_id', wine.user_id);
  for (const col of ['producer', 'wine_name', 'vintage', 'bottle_size_ml'] as const) {
    const v = wine[col];
    rowsQuery = v == null ? rowsQuery.is(col, null) : rowsQuery.eq(col, v);
  }
  const { data: rows, error: rowsErr } = await rowsQuery;
  if (rowsErr) throw rowsErr;
  const wineIds = Array.from(new Set([wine.id, ...alsoIds, ...(rows ?? []).map((r: { id: string }) => r.id)]));

  const { data, error } = await supabase
    .from('cellar_wine_removals')
    .select('id, removed_at, count')
    .in('cellar_wine_id', wineIds)
    .order('removed_at', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  const logs = (data ?? []) as Pick<CellarWineRemoval, 'id' | 'removed_at' | 'count'>[];
  const exact = logs.find((l) => l.removed_at === day && l.count === count);
  let left = count;
  for (const log of exact ? [exact] : logs) {
    if (left <= 0) break;
    const { error: writeErr } = log.count <= left
      ? await supabase.from('cellar_wine_removals').delete().eq('id', log.id)
      : await supabase.from('cellar_wine_removals').update({ count: log.count - left }).eq('id', log.id);
    if (writeErr) throw writeErr;
    left -= log.count;
  }
}

// Heal data left by older versions of the app: a wine still sitting in a rack
// slot is by definition in the live cellar, but some were left with archived_at
// set — they showed in the rack yet were missing from the cellar list and stats.
// Clears that flag for any such wine. Idempotent; a no-op for view-only members
// (they can't write the owner's rows). Returns how many wines it fixed.
export async function repairRackedWines(userId: string): Promise<number> {
  if (!canEditCellar()) return 0;
  type SlotRow = { cellar_wine_id: string | null };
  let slots: SlotRow[];
  try {
    slots = await selectAllPages<SlotRow>((from, to) =>
      supabase
        .from('rack_slots')
        .select('cellar_wine_id, wine_racks!inner(user_id)')
        .eq('wine_racks.user_id', cellarOwner(userId))
        .not('cellar_wine_id', 'is', null)
        .order('id', { ascending: true })
        .range(from, to));
  } catch (err) {
    console.error('[repairRackedWines] could not read rack assignments:', err);
    return 0;
  }

  let fixed = 0;
  for (const chunk of chunkIds(slots.map((s) => s.cellar_wine_id))) {
    const { data, error } = await supabase
      .from('cellar_wines')
      .update({ archived_at: null })
      .in('id', chunk)
      .not('archived_at', 'is', null)
      .select('id');
    if (error) console.error('[repairRackedWines] archive reset failed:', error);
    fixed += (data ?? []).length;
  }
  return fixed;
}

// Newest archive first. Paged past PostgREST's 1000-row cap, like getCellarWines.
export async function getArchivedWines(userId: string, prev?: CellarWine[]): Promise<CellarWine[]> {
  return syncList(archiveList(userId), prev);
}

// Fetch a single cellar wine by id — used when a screen holds a per-location
// VIEW of a wine (its row's quantity is the location count, not the true total)
// and needs the authoritative full row before a scoped archive.
export async function getCellarWineById(id: string): Promise<CellarWine | null> {
  const { data, error } = await supabase.from('cellar_wines').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as CellarWine) ?? null;
}

// A row to insert: who it belongs to, the wine and how many bottles. Every other
// column is nullable or has a database default.
export type NewCellarWine = Pick<CellarWine, 'user_id' | 'wine_name' | 'quantity'>
  & Partial<Omit<CellarWine, 'id' | 'created_at' | 'updated_at'>>;

export async function addCellarWine(wine: NewCellarWine): Promise<CellarWine> {
  // Cellar bottles go into the shared cellar (the owner's id).
  assertCanEditCellar();
  const row = { ...wine, user_id: cellarOwner(wine.user_id) };
  const { data, error } = await supabase
    .from('cellar_wines')
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Add many wines in one write (a cellar import). The caller picks each row's
// id, so re-sending a batch whose reply was lost adds nothing twice: rows that
// already landed are skipped. Returns the ids actually added this time.
export async function addCellarWines(rows: (NewCellarWine & { id: string })[]): Promise<string[]> {
  assertCanEditCellar();
  if (!rows.length) return [];
  const { data, error } = await supabase
    .from('cellar_wines')
    .upsert(rows.map((r) => ({ ...r, user_id: cellarOwner(r.user_id) })), { onConflict: 'id', ignoreDuplicates: true })
    .select('id');
  if (error) throw error;
  return (data ?? []).map((r) => r.id as string);
}

export async function updateCellarWine(id: string, updates: Partial<CellarWine>): Promise<void> {
  const { data, error } = await supabase
    .from('cellar_wines')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id');
  if (error) throw error;
  // A stale/expired session (RLS matches zero rows, no error) makes the update a
  // silent no-op — the same guard deleteCellarWine uses. Without
  // it, a partial-archive quantity decrement could silently not happen.
  if (!data || data.length === 0) {
    if (!canEditCellar()) throw new Error(VIEW_ONLY_MESSAGE);
    throw new Error('That wine could not be updated — please pull to refresh (you may need to sign in again).');
  }
}

export async function deleteCellarWine(id: string): Promise<void> {
  const { data, error } = await supabase.from('cellar_wines').delete().eq('id', id).select('id');
  if (error) throw error;
  // Verify a row was ACTUALLY deleted. Supabase returns success with zero rows
  // deleted (and no error) when RLS matches nothing — e.g. a stale/expired
  // session after switching accounts. Without this check that silent no-op
  // reads as success, the list optimistically clears, and the wine survives in
  // the database (the "deleted wines that came back" bug).
  if (!data || data.length === 0) {
    if (!canEditCellar()) throw new Error(VIEW_ONLY_MESSAGE);
    throw new Error('That wine could not be deleted — please pull to refresh (you may need to sign in again).');
  }
}

// The ACTIVE (non-archived) line for this wine, straight from the database
// rather than a possibly-stale client cache — so re-adding a wine joins its
// existing line instead of creating a duplicate. Same rule as every add path
// (findSameCellarWine): same wine and vintage, and the same bottle size when
// sizeMl is given.
export async function findCellarWineByIdentity(
  userId: string,
  candidate: WineLike,
  sizeMl?: number | null,
): Promise<CellarWine | null> {
  // Paged — PostgREST caps a select at 1000 rows, so a big (imported) cellar
  // would otherwise miss the match and create a duplicate line.
  const list = await selectAllPages<CellarWine>((from, to) =>
    supabase
      .from('cellar_wines')
      .select('*')
      .eq('user_id', cellarOwner(userId))
      .is('archived_at', null)
      .order('id', { ascending: true })
      .range(from, to) as any);
  return findSameCellarWine(list, candidate, sizeMl) ?? null;
}

// Give a wine a web-found label only while it still has no picture: one
// conditional update, so it can never replace a photo that landed first.
// Returns whether the label was used.
export async function setAutoLabelIfMissing(id: string, path: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('cellar_wines')
    .update({ label_image_path: path, updated_at: new Date().toISOString() })
    .eq('id', id)
    .is('label_image_path', null)
    .select('id');
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

// Record when a purchase price was set (migration 124). Separate, best-effort
// write so a price save never fails if the column isn't there yet.
export async function stampPurchasePriceDate(id: string): Promise<void> {
  try {
    await supabase.from('cellar_wines').update({ purchase_price_at: new Date().toISOString() }).eq('id', id);
  } catch { /* column not migrated yet — the card falls back to the cellared date */ }
}
