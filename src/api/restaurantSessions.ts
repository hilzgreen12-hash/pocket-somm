import { supabase } from './supabase';

// A "manual" restaurant review is just a scan_sessions row created WITHOUT a
// wine-list scan — so the existing RestaurantReviewModal (which edits a
// scan_sessions row by id and saves to Your Restaurants) can be reused to add a
// restaurant by hand. Only user_id is required (RLS gates on auth.uid() =
// user_id); everything else is nullable/defaulted.
export async function createManualRestaurantSession(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('scan_sessions')
    .insert({ user_id: userId, extracted_wines: [] })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}

// Attach (or replace / clear) the restaurant-visit photo path on a scan_sessions
// row. Path lives in the wine-labels bucket; null clears it. Migration 088.
export async function setRestaurantPhotoPath(sessionId: string, path: string | null): Promise<void> {
  const { error } = await supabase
    .from('scan_sessions')
    .update({ restaurant_photo_path: path })
    .eq('id', sessionId);
  if (error) throw error;
}

// Used to clean up a blank manual row if the user cancels the review without
// saving anything (so empty drafts don't linger in Your Restaurants).
export async function deleteScanSession(id: string): Promise<void> {
  const { error } = await supabase.from('scan_sessions').delete().eq('id', id);
  if (error) throw error;
}
