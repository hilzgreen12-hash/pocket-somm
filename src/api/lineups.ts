import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { supabase } from './supabase';

// Lineup photos share the wine-labels bucket (per-user-folder RLS already
// covers the lineups/ subfolder). Records live in public.lineup_archives.
const BUCKET = 'wine-labels';

export interface LineupArchive {
  id: string;
  user_id: string;
  image_path: string;
  bottle_count: number | null;
  archived_at: string;
  created_at: string;
  is_favourite: boolean;
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
  bottleCount: number,
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
    .insert({ user_id: userId, image_path: path, bottle_count: bottleCount })
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

export async function setLineupFavourite(id: string, isFavourite: boolean): Promise<void> {
  const { error } = await supabase.from('lineup_archives').update({ is_favourite: isFavourite }).eq('id', id);
  if (error) throw error;
}

export async function lineupSignedUrl(path: string | null | undefined, expiresIn = 3600): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn);
  if (error) return null;
  return data?.signedUrl ?? null;
}
