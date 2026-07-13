import { supabase } from './supabase';
import type { StorageLocation, StorageCase, CellarWine } from '../types/wine';

// Home storage locations (migration 064) — non-grid spaces the user photographs
// and fills with a loose list of wines via cellar_wines.storage_location_id.
// Photos live in the wine-labels bucket; display via useLabelImageUrl.

const LIST_COLS = 'id, user_id, name, photo_path, created_at';

// All of a user's home storage locations, newest last, each with a wine count.
export async function fetchStorageLocations(userId: string): Promise<StorageLocation[]> {
  const { data, error } = await supabase
    .from('storage_locations')
    // Pull the (non-archived) wines' quantities so the card shows a real BOTTLE
    // count — the old embedded count(*) counted rows and included archived wines.
    .select(`${LIST_COLS}, cellar_wines(quantity, archived_at)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: any) => {
    const wines: Array<{ quantity?: number | null; archived_at?: string | null }> = Array.isArray(r.cellar_wines) ? r.cellar_wines : [];
    const wineCount = wines.filter((w) => !w.archived_at).reduce((sum, w) => sum + (w.quantity ?? 1), 0);
    return {
      id: r.id,
      user_id: r.user_id,
      name: r.name,
      photo_path: r.photo_path,
      created_at: r.created_at,
      wineCount,
    };
  });
}

export async function fetchStorageLocation(id: string): Promise<StorageLocation | null> {
  const { data, error } = await supabase
    .from('storage_locations')
    .select(LIST_COLS)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as StorageLocation) ?? null;
}

export async function createStorageLocation(userId: string, name: string): Promise<StorageLocation> {
  const { data, error } = await supabase
    .from('storage_locations')
    .insert({ user_id: userId, name: name.trim() || 'My Location' })
    .select(LIST_COLS)
    .single();
  if (error) throw error;
  return data as StorageLocation;
}

export async function setStorageLocationPhoto(id: string, photoPath: string): Promise<void> {
  const { error } = await supabase.from('storage_locations').update({ photo_path: photoPath }).eq('id', id);
  if (error) throw error;
}

export async function renameStorageLocation(id: string, name: string): Promise<void> {
  const { error } = await supabase.from('storage_locations').update({ name: name.trim() || 'My Location' }).eq('id', id);
  if (error) throw error;
}

export async function deleteStorageLocation(id: string): Promise<void> {
  // Grab the photo path before deleting the row so we can clean up Storage too.
  const { data } = await supabase.from('storage_locations').select('photo_path').eq('id', id).maybeSingle();
  const { error } = await supabase.from('storage_locations').delete().eq('id', id);
  if (error) throw error;
  const path = (data as { photo_path?: string | null } | null)?.photo_path;
  if (path) {
    try { await supabase.storage.from('wine-labels').remove([path]); } catch { /* best-effort cleanup */ }
  }
}

// Wines physically filed into this location (newest first).
export async function fetchStorageLocationWines(locationId: string): Promise<CellarWine[]> {
  const { data, error } = await supabase
    .from('cellar_wines')
    .select('*')
    .eq('storage_location_id', locationId)
    .is('archived_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as CellarWine[];
}

// File (or unfile, with null) a wine into a location.
export async function assignWineToStorageLocation(wineId: string, locationId: string | null): Promise<void> {
  const { error } = await supabase.from('cellar_wines').update({ storage_location_id: locationId }).eq('id', wineId);
  if (error) throw error;
}

// ---- Cases (migration 069) — bottles boxed together inside a location. ----

const CASE_COLS = 'id, user_id, storage_location_id, name, kind, note, created_at';

export async function createStorageCase(
  userId: string,
  input: { storageLocationId: string; name: string; kind: 'single' | 'mixed'; note?: string | null },
): Promise<StorageCase> {
  const { data, error } = await supabase
    .from('storage_cases')
    .insert({
      user_id: userId,
      storage_location_id: input.storageLocationId,
      name: input.name.trim() || (input.kind === 'mixed' ? 'Mixed Case' : 'Case'),
      kind: input.kind,
      note: input.note?.trim() || null,
    })
    .select(CASE_COLS)
    .single();
  if (error) throw error;
  return data as StorageCase;
}

// All cases in a location (oldest first, so the list order is stable).
export async function fetchStorageLocationCases(locationId: string): Promise<StorageCase[]> {
  const { data, error } = await supabase
    .from('storage_cases')
    .select(CASE_COLS)
    .eq('storage_location_id', locationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as StorageCase[];
}

export async function updateStorageCase(id: string, updates: { name?: string; note?: string | null }): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (updates.name !== undefined) patch.name = updates.name.trim() || 'Case';
  if (updates.note !== undefined) patch.note = updates.note?.trim() || null;
  if (Object.keys(patch).length === 0) return;
  const { error } = await supabase.from('storage_cases').update(patch).eq('id', id);
  if (error) throw error;
}

// Dissolve a case: its wines fall back to loose bottles (case_id → null via the
// FK's ON DELETE SET NULL) but stay in the location.
export async function deleteStorageCase(id: string): Promise<void> {
  const { error } = await supabase.from('storage_cases').delete().eq('id', id);
  if (error) throw error;
}

// File (or unfile, with null) a wine into a case.
export async function assignWineToCase(wineId: string, caseId: string | null): Promise<void> {
  const { error } = await supabase.from('cellar_wines').update({ case_id: caseId }).eq('id', wineId);
  if (error) throw error;
}
