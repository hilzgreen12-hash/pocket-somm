import { supabase } from './supabase';
import { evictCachedLabel } from './labelImageCache';
import type { StorageLocation, StorageCase, CellarWine } from '../types/wine';

// Home storage locations (migration 064) — non-grid spaces the user photographs
// and fills with a loose list of wines via cellar_wines.storage_location_id.
// Photos live in the wine-labels bucket; display via useLabelImageUrl.

const LIST_COLS = 'id, user_id, name, photo_path, created_at, is_external';

// All of a user's home storage locations, newest last, each with a wine count.
export async function fetchStorageLocations(userId: string): Promise<StorageLocation[]> {
  const { data, error } = await supabase
    .from('storage_locations')
    .select(LIST_COLS)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  const locs = (data ?? []) as any[];
  // Bottle counts come from location PLACEMENTS now (a wine can be split across a
  // rack and an alt cellar), excluding archived/wishlist wines.
  const { data: placements, error: pErr } = await supabase
    .from('cellar_placements')
    .select('quantity, storage_location_id, cellar_wines(archived_at, is_wishlist)')
    .eq('kind', 'location')
    .not('storage_location_id', 'is', null);
  if (pErr) throw pErr;
  const countByLoc = new Map<string, number>();
  for (const p of (placements ?? []) as any[]) {
    const w = p.cellar_wines;
    if (w && (w.archived_at || w.is_wishlist)) continue;
    if (!p.storage_location_id) continue;
    countByLoc.set(p.storage_location_id, (countByLoc.get(p.storage_location_id) ?? 0) + (p.quantity ?? 0));
  }
  return locs.map((r) => ({
    id: r.id,
    user_id: r.user_id,
    name: r.name,
    photo_path: r.photo_path,
    created_at: r.created_at,
    is_external: !!r.is_external,
    wineCount: countByLoc.get(r.id) ?? 0,
  }));
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

export async function createStorageLocation(userId: string, name: string, isExternal = false): Promise<StorageLocation> {
  const { data, error } = await supabase
    .from('storage_locations')
    .insert({ user_id: userId, name: name.trim() || 'My Location', is_external: isExternal })
    .select(LIST_COLS)
    .single();
  if (error) throw error;
  return data as StorageLocation;
}

// Toggle an Alt Cellar between at-home and external.
export async function setStorageLocationExternal(id: string, isExternal: boolean): Promise<void> {
  const { error } = await supabase
    .from('storage_locations')
    .update({ is_external: isExternal })
    .eq('id', id);
  if (error) throw error;
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
    for (const p of paths) evictCachedLabel(p); // drop local cached copies too
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
    // Default list reads in the order wines were added (oldest first).
    .order('created_at', { ascending: true });
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

// A case is just a named box of bottles inside a location — no "type" anymore
// (the retired mixed / complete / owc / non_owc labelling is gone). The
// storage_cases.kind column still exists in the DB with a NOT NULL default, so
// we simply stop setting it; any legacy value is ignored by the app.
export async function createStorageCase(
  userId: string,
  input: { storageLocationId: string; name: string; note?: string | null },
): Promise<StorageCase> {
  const { data, error } = await supabase
    .from('storage_cases')
    .insert({
      user_id: userId,
      storage_location_id: input.storageLocationId,
      name: input.name.trim() || 'Case',
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

// Fetch specific cases by id (to resolve names for location placements).
export async function fetchStorageCasesByIds(ids: string[]): Promise<StorageCase[]> {
  const clean = Array.from(new Set(ids.filter(Boolean)));
  if (clean.length === 0) return [];
  const { data, error } = await supabase.from('storage_cases').select(CASE_COLS).in('id', clean);
  if (error) throw error;
  return (data ?? []) as StorageCase[];
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
  // Case membership now lives on cellar_placements (case_id), NOT cellar_wines —
  // so a case is "empty" only when no PLACEMENT points at it. (Checking the old
  // cellar_wines.case_id here would wrongly delete every case.)
  const { data: cases, error } = await supabase
    .from('storage_cases')
    .select('id')
    .eq('storage_location_id', locationId);
  if (error) throw error;
  const caseIds = (cases ?? []).map((c: any) => c.id as string);
  if (caseIds.length === 0) return;
  const { data: used, error: pErr } = await supabase
    .from('cellar_placements')
    .select('case_id')
    .in('case_id', caseIds);
  if (pErr) throw pErr;
  const usedIds = new Set((used ?? []).map((p: any) => p.case_id).filter(Boolean));
  const emptyIds = caseIds.filter((id) => !usedIds.has(id));
  if (emptyIds.length === 0) return;
  const { error: delErr } = await supabase.from('storage_cases').delete().in('id', emptyIds);
  if (delErr) throw delErr;
}
