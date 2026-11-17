import { supabase } from './supabase';
import { removeRestaurantPhoto } from './labelPhotos';

// A restaurant visit is a scan_sessions row. A visit added by hand ("Add +" on
// Your Restaurant Reviews) is simply a row created WITHOUT a wine-list scan, so
// RestaurantReviewModal edits both kinds the same way. Only user_id is required
// (RLS gates on auth.uid() = user_id); everything else is nullable/defaulted.
export async function createManualRestaurantSession(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('scan_sessions')
    .insert({ user_id: userId, extracted_wines: [] })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}

// Attach, replace or clear (path = null) the visit's photo (migration 088).
// The update is checked by row count: RLS or a deleted visit matches zero rows
// without an error, which would otherwise look like success. On failure the
// newly uploaded file is removed; on success the file it replaced is.
export async function setRestaurantPhotoPath(sessionId: string, path: string | null): Promise<void> {
  const { data: before } = await supabase
    .from('scan_sessions')
    .select('restaurant_photo_path')
    .eq('id', sessionId)
    .maybeSingle();
  const { data, error } = await supabase
    .from('scan_sessions')
    .update({ restaurant_photo_path: path })
    .eq('id', sessionId)
    .select('id');
  if (error || !data?.length) {
    void removeRestaurantPhoto(path);
    if (error) throw error;
    throw new Error('This visit could not be found — it may have been deleted.');
  }
  const previous = before?.restaurant_photo_path as string | null | undefined;
  if (previous && previous !== path) void removeRestaurantPhoto(previous);
}

// Delete a visit and (best-effort) its photo. Wines linked to it stay in Your
// Wine Reviews — the chosen_wines FK is ON DELETE SET NULL.
export async function deleteScanSession(id: string): Promise<void> {
  const { data, error } = await supabase
    .from('scan_sessions')
    .delete()
    .eq('id', id)
    .select('restaurant_photo_path');
  if (error) throw error;
  if (!data?.length) throw new Error('That visit could not be deleted — please refresh and try again.');
  void removeRestaurantPhoto(data[0].restaurant_photo_path as string | null);
}

const CONTENT_COLUMNS = [
  'restaurant_name', 'restaurant_note', 'restaurant_photo_path', 'rating_overall', 'rating_food',
  'rating_service', 'rating_wine_list', 'rating_value', 'rating_atmosphere', 'rating_glassware',
] as const;

// A hand-made visit ("Add +") is created before the user types anything. If
// they back out, delete it — but only when nothing at all was saved on it (no
// name, note, rating or photo, and no wines). Checked against the database, not
// the screen's cache, so a bottle added a moment ago still counts. Returns
// whether the row was deleted.
export async function discardEmptyVisit(id: string): Promise<boolean> {
  const { data: row, error } = await supabase
    .from('scan_sessions')
    .select(CONTENT_COLUMNS.join(', '))
    .eq('id', id)
    .maybeSingle();
  if (error || !row) return false;
  const values = row as unknown as Record<string, unknown>;
  if (CONTENT_COLUMNS.some((c) => values[c] != null && String(values[c]).trim() !== '')) return false;
  const { count } = await supabase
    .from('chosen_wines')
    .select('id', { count: 'exact', head: true })
    .eq('scan_session_id', id);
  if (count !== 0) return false;
  await deleteScanSession(id);
  return true;
}
