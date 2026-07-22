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
    .select(`${LIST_COLS}, cellar_wines(quantity, archived_at, is_wishlist)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: any) => {
    const wines: Array<{ quantity?: number | null; archived_at?: string | null; is_wishlist?: boolean | null }> = Array.isArray(r.cellar_wines) ? r.cellar_wines : [];
    // Exclude wishlist wines (unowned) — they aren't physically stored here, so
    // they must not inflate the bottle count. Mirrors the rack path (S2).
    const wineCount = wines.filter((w) => !w.archived_at && !w.is_wishlist).reduce((sum, w) => sum + (w.quantity ?? 1), 0);
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
  // Grab user_id + photo path before deleting so we can clean up Storage too.
  // We capture (not drop) the read error — cleanup is best-effort, but the read
  // failing is worth not swallowing silently (B1).
  const { data, error: readErr } = await supabase
    .from('storage_locations').select('user_id, photo_path').eq('id', id).maybeSingle();
  const { error } = await supabase.from('storage_locations').delete().eq('id', id);
  if (error) throw error;
  const row = data as { user_id?: string; photo_path?: string | null } | null;
  const paths = new Set<string>();
  if (row?.photo_path) paths.add(row.photo_path);
  // Also remove the DETERMINISTIC upload path — so a photo that was uploaded but
  // whose photo_path never persisted (D5) is still cleaned up rather than
  // orphaned in the bucket forever.
  if (row?.user_id) paths.add(`${row.user_id}/locations/${id}.jpg`);
  if (paths.size > 0) {
    try { await supabase.storage.from('wine-labels').remove([...paths]); } catch { /* best-effort cleanup */ }
  }
  if (readErr) { /* tolerated: the row delete above is the operation that matters */ }
}

// Wines physically filed into this location (newest first).
export async function fetchStorageLocationWines(locationId: string): Promise<CellarWine[]> {
  const { data, error } = await supabase
    .from('cellar_wines')
    .select('*')
    .eq('storage_location_id', locationId)
    .is('archived_at', null)
    // Wishlist wines aren't physically here — exclude them so the location list
    // and its count match the racks (S2).
    .eq('is_wishlist', false)
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

// Case packaging kinds (migration 073). Loose is a UI-only choice (no case row).
export type CaseKind = 'single' | 'mixed' | 'owc' | 'non_owc';

// User-facing label for a case's packaging kind, shared across the add flow,
// the location card chips and the Cases filter so the wording stays in sync.
export function caseKindLabel(kind: string): string {
  switch (kind) {
    case 'owc': return 'OWC Complete';
    case 'non_owc': return 'Non-OWC Complete';
    case 'mixed': return 'Mixed';
    default: return 'Case'; // legacy 'single'
  }
}

export async function createStorageCase(
  userId: string,
  input: { storageLocationId: string; name: string; kind: CaseKind; note?: string | null },
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

// Delete any case in this location that no longer holds a wine — so an emptied
// case doesn't linger as a nameless orphan (still surfacing its old name in the
// add-a-wine flow) after its bottles are removed, deleted, or archived.
export async function deleteEmptyCasesForLocation(locationId: string): Promise<void> {
  const { data, error } = await supabase
    .from('storage_cases')
    .select('id, cellar_wines(id)')
    .eq('storage_location_id', locationId);
  if (error) throw error;
  const emptyIds = (data ?? [])
    .filter((c: any) => (Array.isArray(c.cellar_wines) ? c.cellar_wines.length : 0) === 0)
    .map((c: any) => c.id as string);
  if (emptyIds.length === 0) return;
  const { error: delErr } = await supabase.from('storage_cases').delete().in('id', emptyIds);
  if (delErr) throw delErr;
}
