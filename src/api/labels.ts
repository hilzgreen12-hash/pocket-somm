import * as Crypto from 'expo-crypto';
import { supabase } from './supabase';
import { uploadLibraryLabel } from './labelPhotos';
import type { LibraryLabel, WineIntelligence } from '../types/wine';

// Your Label Library data access (migration 066 `labels` table). A label is a
// standalone photo record — it can exist without a cellar or review row. See
// the migration for the shape.

export async function fetchLabels(userId: string): Promise<LibraryLabel[]> {
  const { data, error } = await supabase
    .from('labels')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as LibraryLabel[];
}

export interface CreateLabelInput {
  // Either a local image uri to upload, or an already-stored path to reference
  // as-is (e.g. "Select from Cellar" reuses the cellar wine's photo). Exactly
  // one is expected; imageUri takes precedence when both are set.
  imageUri?: string | null;
  imagePath?: string | null;
  producer?: string | null;
  wineName?: string | null;
  vintage?: string | number | null;
  region?: string | null;
  intel?: WineIntelligence | null;
  city?: string | null;
  place?: string | null;
}

// Create a label. When imageUri is given we mint the row id up front (so the
// photo lands at {userId}/labels/{id}.jpg) then insert with that id — one
// upload, one insert, no null-path window.
export async function createLabel(userId: string, input: CreateLabelInput): Promise<LibraryLabel> {
  const id = Crypto.randomUUID();
  let path: string | null = input.imagePath ?? null;
  if (input.imageUri) {
    path = await uploadLibraryLabel(userId, input.imageUri, id);
  }
  const v = input.vintage;
  const vintageInt = v == null || !Number.isFinite(Number(v)) ? null : Math.trunc(Number(v));
  const { data, error } = await supabase
    .from('labels')
    .insert({
      id,
      user_id: userId,
      label_image_path: path,
      producer: input.producer?.trim() || null,
      wine_name: input.wineName?.trim() || null,
      vintage: vintageInt,
      region: input.region?.trim() || null,
      intel: input.intel ?? null,
      captured_city: input.city?.trim() || null,
      captured_place: input.place?.trim() || null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as LibraryLabel;
}

// Remove a label row. We deliberately DON'T delete the storage object: a
// "Select from Cellar" label references the cellar wine's shared photo, so
// removing it here would blank the cellar card. Orphaned scan/review photos
// are tiny and harmless; leaving them avoids ever deleting a photo still in use.
export async function deleteLabel(id: string): Promise<void> {
  const { error } = await supabase.from('labels').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function setLabelFavourite(id: string, value: boolean): Promise<void> {
  const { error } = await supabase.from('labels').update({ is_favourite: value }).eq('id', id);
  if (error) throw new Error(error.message);
}
