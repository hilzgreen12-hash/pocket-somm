import { supabase } from './supabase';
import type { CellarWine } from '../types/wine';

export async function getCellarWines(userId: string): Promise<CellarWine[]> {
  const { data, error } = await supabase
    .from('cellar_wines')
    .select('*')
    .eq('user_id', userId)
    .eq('is_wishlist', false)
    .is('archived_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
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
  const { data, error } = await supabase
    .from('cellar_wine_removals')
    .insert({
      user_id: user.id,
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
    .eq('wine_racks.user_id', userId)
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
  const { error } = await supabase
    .from('cellar_wines')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function getArchivedWines(userId: string): Promise<CellarWine[]> {
  const { data, error } = await supabase
    .from('cellar_wines')
    .select('*')
    .eq('user_id', userId)
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

export async function addCellarWine(wine: Omit<CellarWine, 'id' | 'created_at' | 'updated_at'>): Promise<CellarWine> {
  const { data, error } = await supabase
    .from('cellar_wines')
    .insert(wine)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCellarWine(id: string, updates: Partial<CellarWine>): Promise<void> {
  const { error } = await supabase
    .from('cellar_wines')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteCellarWine(id: string): Promise<void> {
  const { error } = await supabase.from('cellar_wines').delete().eq('id', id);
  if (error) throw error;
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
