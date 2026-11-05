import { supabase } from './supabase';
import { cellarOwner, assertCanEditCellar, canEditCellar, VIEW_ONLY_MESSAGE } from './cellarContext';
import { selectAllPages } from './paging';
import type { CellarWine } from '../types/wine';
import { wineNameKey } from '../utils/wineIdentity';
import { clearWineFromRacks } from './racks';

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
      .eq('is_wishlist', false)
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

export interface CellarWineRemoval {
  id: string;
  user_id: string;
  cellar_wine_id: string;
  removed_at: string;
  count: number;
  note: string | null;
  created_at: string;
}

export async function listCellarWineRemovals(cellarWineId: string): Promise<CellarWineRemoval[]> {
  const { data, error } = await supabase
    .from('cellar_wine_removals')
    .select('*')
    .eq('cellar_wine_id', cellarWineId)
    .order('removed_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as CellarWineRemoval[];
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

export async function updateCellarWineRemoval(id: string, updates: { note?: string | null }): Promise<void> {
  const { error } = await supabase.from('cellar_wine_removals').update(updates).eq('id', id);
  if (error) throw error;
}

// Distinct cellar_wine ids that have at least one logged removal (a bottle
// drunk/archived from this wine). Used to tell a wine drawn DOWN to its last
// bottle ("running low" → replenish) from one that was simply added as a single.
// RLS scopes the read to the signed-in user, so no user filter is needed.
export async function fetchWineIdsWithRemovals(): Promise<string[]> {
  const { data, error } = await supabase.from('cellar_wine_removals').select('cellar_wine_id');
  if (error) throw error;
  return Array.from(new Set((data ?? []).map((r: any) => r.cellar_wine_id).filter(Boolean)));
}

// Heal data inconsistency: if a wine is currently assigned to a rack_slot, it
// is by definition part of the user's live cellar. Older versions of the app
// occasionally left wines flagged is_wishlist=true or archived_at non-null
// while still referenced from a slot — those wines showed in the rack view
// but were excluded from getCellarWines, View Cellar Wine Notes, etc.
// This function clears those flags for any wine currently in any of the
// user's racks. It's idempotent (no-op when nothing's wrong) and safe to call
// on every cellar list mount.
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

  let fixed = 0;
  // Reset wishlist flag on racked wines that are wrongly flagged.
  const { data: wlFixed, error: wlErr } = await supabase
    .from('cellar_wines')
    .update({ is_wishlist: false })
    .in('id', wineIds)
    .eq('is_wishlist', true)
    .select('id');
  if (wlErr) console.error('[repairRackedWines] wishlist reset failed:', wlErr);
  fixed += (wlFixed ?? []).length;

  // Restore archived flag on racked wines that are wrongly archived.
  const { data: arFixed, error: arErr } = await supabase
    .from('cellar_wines')
    .update({ archived_at: null })
    .in('id', wineIds)
    .not('archived_at', 'is', null)
    .select('id');
  if (arErr) console.error('[repairRackedWines] archive reset failed:', arErr);
  fixed += (arFixed ?? []).length;

  return fixed;
}

export async function archiveCellarWine(id: string): Promise<void> {
  const { data, error } = await supabase
    .from('cellar_wines')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id)
    .select('id');
  if (error) throw error;
  // A stale / expired session (e.g. right after switching accounts) makes RLS
  // match zero rows and return NO error — so the update silently does nothing.
  // Treat "affected nothing" as a failure so the UI can't falsely report success.
  if (!data || data.length === 0) {
    if (!canEditCellar()) throw new Error(VIEW_ONLY_MESSAGE);
    throw new Error('That wine could not be updated — please pull to refresh (you may need to sign in again).');
  }
  // An archived wine has left physical storage, so detach it from EVERY spot:
  // rack/fridge slots AND all cellar_placements (rack, bin and — crucially —
  // alt-cellar 'location' rows). Location placements are app-owned since
  // migration 106 (the DB no longer mirrors/clears them), so without this the
  // alt-cellar screen — which reads cellar_placements — keeps showing the
  // archived bottle's thumbnail even after a refetch. Centralised here so every
  // full-archive caller (Full Cellar List, bulk select, useCellar, voice) is
  // covered, not just the ones that happened to call clearWineFromRacks.
  await clearWineFromRacks(id);
  const { error: pErr } = await supabase.from('cellar_placements').delete().eq('cellar_wine_id', id);
  if (pErr) throw pErr;
}

export async function getArchivedWines(userId: string): Promise<CellarWine[]> {
  const { data, error } = await supabase
    .from('cellar_wines')
    .select('*')
    .eq('user_id', cellarOwner(userId))
    .eq('is_wishlist', false)
    .not('archived_at', 'is', null)
    .order('archived_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getWishListWines(userId: string): Promise<CellarWine[]> {
  const { data, error } = await supabase
    .from('cellar_wines')
    .select('*')
    .eq('user_id', userId)
    .eq('is_wishlist', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
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

export async function addCellarWine(wine: Omit<CellarWine, 'id' | 'created_at' | 'updated_at'>): Promise<CellarWine> {
  // Cellar bottles go into the shared cellar (owner's id); wishlist rows stay personal.
  const isWishlist = !!(wine as any).is_wishlist;
  if (!isWishlist) assertCanEditCellar();
  const row = isWishlist ? wine : { ...wine, user_id: cellarOwner((wine as any).user_id) };
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
  // silent no-op — the same guard archiveCellarWine/deleteCellarWine use. Without
  // it, a partial-archive quantity decrement could silently not happen.
  if (!data || data.length === 0) {
    if (!canEditCellar()) throw new Error(VIEW_ONLY_MESSAGE);
    throw new Error('That wine could not be updated — please pull to refresh (you may need to sign in again).');
  }
}

// Look up an active wishlist row for this user that matches the wine
// identity (producer + name + vintage, case-insensitive trimmed). Returns
// null if no match — used by the wine-review sync flow so that saving or
// editing a chosen_wine review pushes the same notes/score/location into
// the wishlist entry if the user has one.
export async function findMatchingWishlistWine(
  userId: string,
  identity: { producer: string | null; wineName: string; vintage: string | number | null }
): Promise<CellarWine | null> {
  const { data, error } = await supabase
    .from('cellar_wines')
    .select('*')
    .eq('user_id', userId)
    .eq('is_wishlist', true)
    .is('archived_at', null);
  if (error) throw error;
  const list = (data ?? []) as CellarWine[];
  const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();
  const wantedProducer = norm(identity.producer);
  const wantedName = norm(identity.wineName);
  const wantedVintage = identity.vintage != null ? String(identity.vintage).trim() : '';
  return list.find((w) =>
    norm(w.producer) === wantedProducer &&
    norm(w.wine_name) === wantedName &&
    (w.vintage ?? '').trim() === wantedVintage
  ) ?? null;
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

// Find an ACTIVE (non-archived, non-wishlist) cellar wine matching a
// producer+name identity, straight from the DB (not a possibly-stale client
// cache) — so re-adding a wine merges into its existing line instead of
// creating a duplicate, even if the cache is momentarily wrong.
export async function findCellarWineByIdentity(
  userId: string,
  identity: { producer: string | null; wineName: string | null; vintage?: string | number | null },
): Promise<CellarWine | null> {
  // Paged — PostgREST caps a select at 1000 rows, so a big (imported) cellar
  // would otherwise miss the match and create a duplicate line.
  const list = await selectAllPages<CellarWine>((from, to) =>
    supabase
      .from('cellar_wines')
      .select('*')
      .eq('user_id', cellarOwner(userId))
      .is('archived_at', null)
      .eq('is_wishlist', false)
      .order('id', { ascending: true })
      .range(from, to) as any);
  // Same wine = same producer+cuvée identity (order-independent word set, so an
  // OCR producer/name split still matches) AND same vintage. Matching on producer
  // alone merged distinct cuvées from one producer into a single row.
  const target = wineNameKey(identity.producer, identity.wineName);
  if (!target) return null;
  const v = identity.vintage != null ? String(identity.vintage).trim().toLowerCase() : '';
  return list.find((w) => {
    if (wineNameKey(w.producer, w.wine_name) !== target) return false;
    return (w.vintage ?? '').toString().trim().toLowerCase() === v;
  }) ?? null;
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
