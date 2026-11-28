import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { supabase } from './supabase';
import { evictCachedLabel, primeCachedLabel } from './labelImageCache';

// Lineup photos share the wine-labels bucket (per-user-folder RLS already
// covers the lineups/ subfolder). Records live in public.lineup_archives.
const BUCKET = 'wine-labels';

// One wine in a saved lineup (migration 065). producer / wine_name / vintage are
// what Vinster read off the label (or the user corrected). cellar_wine_id links
// it to the same wine + vintage in the cellar, when there is one; archived =
// this row's bottles have been moved from the cellar into the cellar archive.
export interface LineupWine {
  producer: string | null;
  wine_name: string;
  vintage: string | number | null;
  cellar_wine_id: string | null;
  archived: boolean;
  count: number;
  // Optional detail read off the label (or set from the lineup's Edit wine
  // pop-up). The column is jsonb, so older rows simply lack these.
  region?: string | null;
  grape?: string | null;
  style?: string | null;
  bottle_size_ml?: number | null;
  // "Mark as from my cellar": the bottle came from the user's cellar but has no
  // cellar entry to link (e.g. drunk before they used Vinster). Shows the Your
  // Cellar stamp; nothing is archived.
  from_cellar?: boolean;
}

export interface LineupArchive {
  id: string;
  user_id: string;
  image_path: string;
  bottle_count: number | null;
  archived_at: string;
  created_at: string;
  is_favourite: boolean;
  note: string | null;
  note_updated_at: string | null;
  wines: LineupWine[] | null;
  city: string | null;
  // Migration 085 — a matched restaurant review (scan_sessions id), if any.
  restaurant_session_id: string | null;
  // Migration 086 — free-text venue / place name (distinct from city).
  venue: string | null;
  // Migration 101 — optional user-given lineup title (falls back to "Your Lineup").
  name?: string | null;
}

function base64ToBytes(base64: string): Uint8Array {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;
  const clean = base64.replace(/^data:[^,]+,/, '').replace(/\s/g, '');
  const len = clean.length;
  let bufferLength = Math.floor(len * 0.75);
  if (clean[len - 1] === '=') bufferLength--;
  if (clean[len - 2] === '=') bufferLength--;
  const bytes = new Uint8Array(bufferLength);
  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const e1 = lookup[clean.charCodeAt(i)];
    const e2 = lookup[clean.charCodeAt(i + 1)];
    const e3 = lookup[clean.charCodeAt(i + 2)];
    const e4 = lookup[clean.charCodeAt(i + 3)];
    if (p < bufferLength) bytes[p++] = (e1 << 2) | (e2 >> 4);
    if (p < bufferLength) bytes[p++] = ((e2 & 15) << 4) | (e3 >> 2);
    if (p < bufferLength) bytes[p++] = ((e3 & 3) << 6) | (e4 & 63);
  }
  return bytes;
}

// Total bottles in a lineup, summed from its wines. bottle_count is the same
// figure stored alongside; it's only the fallback for a lineup with no wines.
export function lineupBottleTotal(l: Pick<LineupArchive, 'wines' | 'bottle_count'>): number {
  if (l.wines?.length) return l.wines.reduce((n, w) => n + (w.count ?? 1), 0);
  return l.bottle_count ?? 0;
}

// Resize + upload a lineup photo to {userId}/lineups/{key}.jpg; returns the path.
async function uploadLineupPhoto(userId: string, localUri: string): Promise<string> {
  const processed = await manipulateAsync(localUri, [{ resize: { width: 1200 } }], {
    compress: 0.7, format: SaveFormat.JPEG, base64: true,
  });
  if (!processed.base64) throw new Error('Image processing returned no data');
  // Client-minted, collision-resistant key (no uuid lib in the app bundle).
  const key = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const path = `${userId}/lineups/${key}.jpg`;
  const bytes = base64ToBytes(processed.base64);
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes.buffer as ArrayBuffer, {
    contentType: 'image/jpeg', upsert: true,
  });
  if (error) throw error;
  // Prime the local cache with these bytes, so the new photo shows at once.
  primeCachedLabel(path, bytes);
  return path;
}

// Best-effort removal of a lineup photo from Storage and the local cache.
async function removeLineupPhoto(path: string | null | undefined): Promise<void> {
  if (!path) return;
  try { await supabase.storage.from(BUCKET).remove([path]); } catch { /* best effort */ }
  evictCachedLabel(path);
}

// Save a new lineup: upload the photo FIRST, then a single insert carrying the
// real image_path — the row never exists without its photo, and the write
// needs only the INSERT policy.
export async function saveLineupArchive(
  userId: string,
  localUri: string,
  // visit: a lineup added from a restaurant review is linked to that visit and
  // carries its restaurant name and date.
  opts: { wines: LineupWine[]; city?: string | null; visit?: { sessionId: string; venue: string | null; date: string | null } },
): Promise<LineupArchive> {
  const path = await uploadLineupPhoto(userId, localUri);
  const { data: row, error } = await supabase
    .from('lineup_archives')
    .insert({
      user_id: userId,
      image_path: path,
      bottle_count: lineupBottleTotal({ wines: opts.wines, bottle_count: null }),
      wines: opts.wines,
      city: opts.city ?? null,
      ...(opts.visit ? {
        restaurant_session_id: opts.visit.sessionId,
        venue: opts.visit.venue,
        ...(opts.visit.date ? { archived_at: opts.visit.date } : {}),
      } : {}),
    })
    .select()
    .single();
  if (error) throw error;
  return row as LineupArchive;
}

// Replace a lineup's photo: upload the new one, repoint image_path, then tidy
// away the old file.
export async function replaceLineupImage(userId: string, id: string, localUri: string): Promise<string> {
  const { data: old } = await supabase.from('lineup_archives').select('image_path').eq('id', id).maybeSingle();
  const path = await uploadLineupPhoto(userId, localUri);
  const { error } = await supabase.from('lineup_archives').update({ image_path: path }).eq('id', id);
  if (error) throw error;
  const oldPath = (old as { image_path?: string | null } | null)?.image_path;
  if (oldPath && oldPath !== path) await removeLineupPhoto(oldPath);
  return path;
}

export async function listLineupArchives(userId: string): Promise<LineupArchive[]> {
  const { data, error } = await supabase
    .from('lineup_archives')
    .select('*')
    .eq('user_id', userId)
    .order('archived_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as LineupArchive[];
}

export async function getLineupArchive(id: string): Promise<LineupArchive | null> {
  const { data, error } = await supabase.from('lineup_archives').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as LineupArchive) ?? null;
}

// Set (or clear) the user-given lineup title. Blank stores null → "Your Lineup".
export async function setLineupName(id: string, name: string | null): Promise<void> {
  const clean = name?.trim() ? name.trim() : null;
  const { error } = await supabase.from('lineup_archives').update({ name: clean }).eq('id', id);
  if (error) throw error;
}

// Attach (or clear) the free-text "memory" note on a lineup. Empty/whitespace
// stores null so the Library can treat a blank note as "no note yet".
export async function setLineupNote(id: string, note: string | null): Promise<void> {
  const clean = note?.trim() ? note.trim() : null;
  const { error } = await supabase
    .from('lineup_archives')
    .update({ note: clean, note_updated_at: clean ? new Date().toISOString() : null })
    .eq('id', id);
  if (error) throw error;
}

// Match (or clear) the restaurant review this lineup belongs to. Pass null to
// unmatch. The id is a scan_sessions row (Your Restaurants).
export async function setLineupRestaurant(id: string, sessionId: string | null): Promise<void> {
  const { error } = await supabase
    .from('lineup_archives')
    .update({ restaurant_session_id: sessionId })
    .eq('id', id);
  if (error) throw error;
}

// Persist a lineup's wines (the `wines` jsonb column, migration 065), keeping
// bottle_count in step.
export async function setLineupWines(id: string, wines: LineupWine[]): Promise<void> {
  const { error } = await supabase
    .from('lineup_archives')
    .update({ wines, bottle_count: lineupBottleTotal({ wines, bottle_count: null }) })
    .eq('id', id);
  if (error) throw error;
}

// Edit a lineup's date · city · venue stamp (from the lineup info screen). city
// and venue are trimmed; a blank clears them. archivedAt is an ISO date string.
export async function updateLineupStamp(id: string, updates: { archivedAt?: string; city?: string | null; venue?: string | null }): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (updates.archivedAt !== undefined) patch.archived_at = updates.archivedAt;
  if (updates.city !== undefined) patch.city = updates.city?.trim() ? updates.city.trim() : null;
  if (updates.venue !== undefined) patch.venue = updates.venue?.trim() ? updates.venue.trim() : null;
  if (Object.keys(patch).length === 0) return;
  const { error } = await supabase.from('lineup_archives').update(patch).eq('id', id);
  if (error) throw error;
}

// Delete a lineup from the library — removes its photo from Storage (best
// effort) and the archive row. Verifies a row was actually removed so a stale
// session can't read as a fake success.
export async function deleteLineupArchive(id: string): Promise<void> {
  const { data: row } = await supabase.from('lineup_archives').select('image_path').eq('id', id).maybeSingle();
  const { data, error } = await supabase.from('lineup_archives').delete().eq('id', id).select('id');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    throw new Error('That lineup could not be deleted — please pull to refresh (you may need to sign in again).');
  }
  await removeLineupPhoto((row as { image_path?: string | null } | null)?.image_path);
}
