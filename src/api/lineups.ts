import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { supabase } from './supabase';
import { evictCachedLabel } from './labelImageCache';

// Lineup photos share the wine-labels bucket (per-user-folder RLS already
// covers the lineups/ subfolder). Records live in public.lineup_archives.
const BUCKET = 'wine-labels';

// One bottle in an archived lineup (migration 065). cellar_wine_id is set when
// the bottle matched the user's cellar; archived = it was archived in this
// session (i.e. it was theirs and they confirmed it).
export interface LineupWine {
  producer: string | null;
  wine_name: string;
  vintage: string | number | null;
  cellar_wine_id: string | null;
  archived: boolean;
  count: number;
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

// Upload the lineup photo and create the archive record in one go. Returns the
// inserted row. The photo path is {userId}/lineups/{key}.jpg.
//
// Upload-FIRST with a client-minted key, then a single insert that already
// carries the real image_path. The previous insert('pending')->upload->update
// dance relied on an UPDATE succeeding, but lineup_archives had no UPDATE RLS
// policy (added in migration 059), so the update silently no-op'd and every row
// was stranded at image_path='pending' — the Library showed no photo. A single
// insert needs only the INSERT policy, so this path no longer depends on UPDATE.
export async function saveLineupArchive(
  userId: string,
  localUri: string,
  bottleCount: number | null = null,
  opts?: { wines?: LineupWine[] | null; city?: string | null },
): Promise<LineupArchive> {
  const processed = await manipulateAsync(localUri, [{ resize: { width: 1200 } }], {
    compress: 0.7, format: SaveFormat.JPEG, base64: true,
  });
  if (!processed.base64) throw new Error('Image processing returned no data');

  // Client-minted, collision-resistant key (no uuid lib in the app bundle).
  const key = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const path = `${userId}/lineups/${key}.jpg`;
  const bytes = base64ToBytes(processed.base64);
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, bytes.buffer as ArrayBuffer, {
    contentType: 'image/jpeg', upsert: true,
  });
  if (upErr) throw upErr;

  const { data: row, error: insErr } = await supabase
    .from('lineup_archives')
    .insert({ user_id: userId, image_path: path, bottle_count: bottleCount, wines: opts?.wines ?? null, city: opts?.city ?? null })
    .select()
    .single();
  if (insErr) throw insErr;

  return row as LineupArchive;
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

export async function setLineupFavourite(id: string, isFavourite: boolean): Promise<void> {
  const { error } = await supabase.from('lineup_archives').update({ is_favourite: isFavourite }).eq('id', id);
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
  const path = (row as { image_path?: string | null } | null)?.image_path;
  if (path) {
    try { await supabase.storage.from(BUCKET).remove([path]); } catch { /* best-effort cleanup */ }
    evictCachedLabel(path); // drop the local cached copy too
  }
}

export async function lineupSignedUrl(path: string | null | undefined, expiresIn = 3600): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn);
  if (error) return null;
  return data?.signedUrl ?? null;
}
