import { supabase } from './supabase';
import type { StorageLocation, CellarWine } from '../types/wine';

// Home storage locations (migration 064) — non-grid spaces the user photographs
// and fills with a loose list of wines via cellar_wines.storage_location_id.
// Photos live in the wine-labels bucket; display via useLabelImageUrl.

const LIST_COLS = 'id, user_id, name, photo_path, created_at';

// All of a user's home storage locations, newest last, each with a wine count.
export async function fetchStorageLocations(userId: string): Promise<StorageLocation[]> {
  const { data, error } = await supabase
    .from('storage_locations')
    .select(`${LIST_COLS}, cellar_wines(count)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.id,
    user_id: r.user_id,
    name: r.name,
    photo_path: r.photo_path,
    created_at: r.created_at,
    wineCount: Array.isArray(r.cellar_wines) ? (r.cellar_wines[0]?.count ?? 0) : 0,
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
  const { error } = await supabase.from('storage_locations').delete().eq('id', id);
  if (error) throw error;
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
