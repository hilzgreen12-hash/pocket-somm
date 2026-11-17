import { supabase } from './supabase';
import { cellarOwner, assertCanEditCellar, canEditCellar, VIEW_ONLY_MESSAGE } from './cellarContext';
import { selectAllPages } from './paging';
import type { CellarWine } from '../types/wine';
import { findSameCellarWine, type WineLike } from '../utils/wineMatch';

export async function getCellarWines(userId: string): Promise<CellarWine[]> {
  // Page through in 1000-row chunks — PostgREST caps a single response at ~1000
  // rows, which silently truncated large (~9k) imported cellars, undercounting
  // Cellar Statistics totals and hiding wines from "From My Cellar" pairing +
  // import de-dup. Fetch every page so callers always see the whole cellar.
  const PAGE = 1000;
  const out: CellarWine[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('cellar_wines')
      .select('*')
      .eq('user_id', cellarOwner(userId))
      .is('archived_at', null)
      .order('created_at', { ascending: false })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    const batch = data ?? [];
    out.push(...batch);
    if (batch.length < PAGE) break;
  }
  return out;
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

// Heal data inconsistency: if a wine is currently assigned to a rack_slot, it
// is by definition part of the user's live cellar. Older versions of the app
// occasionally left wines with archived_at set while still referenced from a
// slot — those wines showed in the rack view but were excluded from
// getCellarWines, View Cellar Wine Notes, etc. This function clears that flag
// for any wine currently in any of the user's racks. It's idempotent (no-op
// when nothing's wrong) and safe to call on every cellar list mount.
export async function repairRackedWines(userId: string): Promise<number> {
  const { data: assignments, error: assignErr } = await supabase
    .from('rack_slots')
    .select('cellar_wine_id, wine_racks!inner(user_id)')
    .eq('wine_racks.user_id', cellarOwner(userId))
    .not('cellar_wine_id', 'is', null);
  if (assignErr) {
    console.error('[repairRackedWines] could not read rack assignments:', assignErr);
    return 0;
  }

  const wineIds = Array.from(new Set(((assignments ?? []) as any[]).map((r) => r.cellar_wine_id))).filter(Boolean) as string[];
  if (wineIds.length === 0) return 0;

  // Un-archive racked wines that are wrongly archived.
  const { data: fixed, error: fixErr } = await supabase
    .from('cellar_wines')
    .update({ archived_at: null })
    .in('id', wineIds)
    .not('archived_at', 'is', null)
    .select('id');
  if (fixErr) console.error('[repairRackedWines] archive reset failed:', fixErr);
  return (fixed ?? []).length;
}

// Newest archive first. Paged past PostgREST's 1000-row cap, like getCellarWines.
export async function getArchivedWines(userId: string): Promise<CellarWine[]> {
  return selectAllPages<CellarWine>((from, to) =>
    supabase
      .from('cellar_wines')
      .select('*')
      .eq('user_id', cellarOwner(userId))
      .not('archived_at', 'is', null)
      .order('archived_at', { ascending: false })
      .order('id', { ascending: true })
      .range(from, to));
}

export async function getSharedCellarWines(ownerId: string): Promise<CellarWine[]> {
  const { data, error } = await supabase
    .from('cellar_wines')
    .select('*')
    .eq('user_id', ownerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
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

export async function shareCellar(ownerId: string, email: string): Promise<void> {
  const { error } = await supabase
    .from('cellar_shares')
    .insert({ owner_id: ownerId, shared_with_email: email });
  if (error) throw error;
}

export async function getCellarShares(ownerId: string): Promise<{ shared_with_email: string; shared_with_id: string | null }[]> {
  const { data, error } = await supabase
    .from('cellar_shares')
    .select('shared_with_email, shared_with_id')
    .eq('owner_id', ownerId);
  if (error) throw error;
  return data ?? [];
}

export async function getSharedWithMe(): Promise<{ owner_id: string; owner_email?: string }[]> {
  const { data, error } = await supabase
    .from('cellar_shares')
    .select('owner_id');
  if (error) throw error;
  return data ?? [];
}

export async function removeCellarShare(ownerId: string, email: string): Promise<void> {
  const { error } = await supabase
    .from('cellar_shares')
    .delete()
    .eq('owner_id', ownerId)
    .eq('shared_with_email', email);
  if (error) throw error;
}

// Record when a purchase price was set (migration 124). Separate, best-effort
// write so a price save never fails if the column isn't there yet.
export async function stampPurchasePriceDate(id: string): Promise<void> {
  try {
    await supabase.from('cellar_wines').update({ purchase_price_at: new Date().toISOString() }).eq('id', id);
  } catch { /* column not migrated yet — the card falls back to the cellared date */ }
}
