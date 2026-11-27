import { supabase } from './supabase';
import { cellarOwner, assertCanEditCellar, refusedWriteError } from './cellarContext';
import { evictCachedLabel } from './labelImageCache';
import { selectAllInChunks } from './paging';
import type { StorageLocation, StorageCase } from '../types/wine';

// Alt cellars (migration 064): non-grid spaces the user photographs — at home,
// or external (offsite, migration 097). Which wines are in one is recorded by
// 'location' placements in cellar_placements. Photos live in the wine-labels
// bucket; display via useLabelImageUrl.

const LIST_COLS = 'id, user_id, name, photo_path, created_at, is_external, stored_at';

// All of the cellar's alt cellars, oldest first.
export async function fetchStorageLocations(userId: string): Promise<StorageLocation[]> {
  const { data, error } = await supabase
    .from('storage_locations')
    .select(LIST_COLS)
    .eq('user_id', cellarOwner(userId))
    .order('created_at', { ascending: true });
  if (error) throw error;
  return ((data ?? []) as StorageLocation[]).map((r) => ({ ...r, is_external: !!r.is_external }));
}

// Bottles of live wines in each of these alt cellars. Asked for home cellars
// only (the Cellar tab's tiles), so a large external import isn't paged through.
export async function fetchLocationBottleCounts(locationIds: string[]): Promise<Record<string, number>> {
  const rows = await selectAllInChunks<{ quantity: number; storage_location_id: string }>(locationIds, (chunk, from, to) =>
    supabase.from('cellar_placements')
      .select('id, quantity, storage_location_id, wine:cellar_wines!inner(archived_at)')
      .eq('kind', 'location')
      .in('storage_location_id', chunk)
      .is('wine.archived_at', null)
      .order('id', { ascending: true })
      .range(from, to) as any);
  const counts: Record<string, number> = {};
  for (const r of rows) counts[r.storage_location_id] = (counts[r.storage_location_id] ?? 0) + (r.quantity ?? 0);
  return counts;
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

export async function createStorageLocation(userId: string, name: string, isExternal = false, storedAt: string | null = null): Promise<StorageLocation> {
  const { data, error } = await supabase
    .from('storage_locations')
    .insert({ user_id: cellarOwner(userId), name: name.trim() || 'My Location', is_external: isExternal, stored_at: storedAt?.trim() || null })
    .select(LIST_COLS)
    .single();
  if (error) throw error;
  return data as StorageLocation;
}

// Where an external cellar is kept ("Stored at …" on the wine card).
export async function setStorageLocationStoredAt(id: string, storedAt: string | null): Promise<void> {
  await updateLocation(id, { stored_at: storedAt?.trim() || null });
}

// Update one alt cellar, failing loudly when RLS refuses (no row changes).
async function updateLocation(id: string, patch: Record<string, unknown>): Promise<void> {
  assertCanEditCellar();
  const { data, error } = await supabase.from('storage_locations').update(patch).eq('id', id).select('id');
  if (error) throw error;
  if (!data?.length) throw refusedWriteError();
}

// Relabel an Alt Cellar as at home or external. Its bottles stay put.
export async function setStorageLocationExternal(id: string, isExternal: boolean): Promise<void> {
  await updateLocation(id, { is_external: isExternal });
}

export async function setStorageLocationPhoto(id: string, photoPath: string): Promise<void> {
  await updateLocation(id, { photo_path: photoPath });
}

export async function renameStorageLocation(id: string, name: string): Promise<void> {
  await updateLocation(id, { name: name.trim() || 'My Location' });
}

export async function deleteStorageLocation(id: string): Promise<void> {
  // Grab user_id + photo path before deleting so we can clean up Storage too.
  // We capture (not drop) the read error — cleanup is best-effort, but the read
  // failing is worth not swallowing silently (B1).
  const { data, error: readErr } = await supabase
    .from('storage_locations').select('user_id, photo_path').eq('id', id).maybeSingle();
  const { data: deleted, error } = await supabase.from('storage_locations').delete().eq('id', id).select('id');
  if (error) throw error;
  if (!deleted?.length) throw refusedWriteError();
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
      user_id: cellarOwner(userId),
      storage_location_id: input.storageLocationId,
      name: input.name.trim() || 'Case',
      note: input.note?.trim() || null,
    })
    .select(CASE_COLS)
    .single();
  if (error) throw error;
  return data as StorageCase;
}

// Many cases in one write (a cellar import). The caller picks each case's id,
// so it can file bottles into them without relying on the returned order.
export async function createStorageCases(
  userId: string,
  cases: { id: string; storageLocationId: string; name: string }[],
): Promise<void> {
  if (!cases.length) return;
  const { error } = await supabase.from('storage_cases').insert(cases.map((c) => ({
    id: c.id, user_id: cellarOwner(userId), storage_location_id: c.storageLocationId, name: c.name.trim() || 'Case',
  })));
  if (error) throw error;
}

// Remove cases a cellar import just created, when filing bottles into them
// failed. In slices, so a large import's ids fit in the request URL.
export async function deleteStorageCases(ids: string[]): Promise<void> {
  for (let i = 0; i < ids.length; i += 100) {
    const { error } = await supabase.from('storage_cases').delete().in('id', ids.slice(i, i + 100));
    if (error) throw error;
  }
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
  assertCanEditCellar();
  const { data, error } = await supabase.from('storage_cases').update(patch).eq('id', id).select('id');
  if (error) throw error;
  if (!data?.length) throw refusedWriteError();
}

// Dissolve a case: its bottles stay in the location, loose (the placements'
// case_id is set null by the FK).
export async function deleteStorageCase(id: string): Promise<void> {
  assertCanEditCellar();
  const { data, error } = await supabase.from('storage_cases').delete().eq('id', id).select('id');
  if (error) throw error;
  if (!data?.length) throw refusedWriteError();
}

// Fetch specific cases by id (to resolve names for location placements).
export async function fetchStorageCasesByIds(ids: string[]): Promise<StorageCase[]> {
  const clean = Array.from(new Set(ids.filter(Boolean)));
  if (clean.length === 0) return [];
  return selectAllInChunks<StorageCase>(clean, (chunk, from, to) =>
    supabase.from('storage_cases').select(CASE_COLS).in('id', chunk)
      .order('id', { ascending: true }).range(from, to) as any);
}
