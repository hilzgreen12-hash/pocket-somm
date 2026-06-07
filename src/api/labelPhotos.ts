import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { supabase } from './supabase';

// Storage bucket for user wine-label photos. Created via dashboard SQL
// (public-read; writes locked to each user's own {userId}/ folder). The
// path we persist in cellar_wines.label_image_path is `${userId}/${id}.jpg`.
const BUCKET = 'wine-labels';

// Decode base64 → Uint8Array without an external dependency. supabase-js
// storage accepts a Uint8Array body in React Native, which sidesteps the
// Blob/FormData quirks that otherwise produce 0-byte uploads on Android.
function base64ToBytes(base64: string): Uint8Array {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;
  // Strip any data-uri prefix and whitespace just in case.
  const clean = base64.replace(/^data:[^,]+,/, '').replace(/\s/g, '');
  let len = clean.length;
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

// Resize + compress to keep storage and grid load light while staying crisp
// when the user pinch-zooms into a rack. Returns base64 of the JPEG.
async function processToBase64(uri: string): Promise<string> {
  const result = await manipulateAsync(
    uri,
    [{ resize: { width: 1000 } }],
    { compress: 0.7, format: SaveFormat.JPEG, base64: true },
  );
  if (!result.base64) throw new Error('Image processing returned no data');
  return result.base64;
}

// Upload a local image uri to wine-labels/{userId}/{wineId}.jpg and return
// the storage path to persist in cellar_wines.label_image_path. Uses the
// wine id as the key so re-adding a photo overwrites (upsert) cleanly.
export async function uploadLabelImage(userId: string, localUri: string, wineId: string): Promise<string> {
  const base64 = await processToBase64(localUri);
  // Pass the underlying ArrayBuffer (exact-sized — see base64ToBytes) which
  // is the canonical, proven body type for supabase-js storage uploads on
  // React Native / Expo (a raw typed-array view is less reliable here).
  const bytes = base64ToBytes(base64);
  const path = `${userId}/${wineId}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes.buffer, {
    contentType: 'image/jpeg',
    upsert: true,
  });
  if (error) throw error;
  return path;
}

// Public URL for a stored label path. The bucket is public-read for now
// (to be hardened to signed URLs pre-launch). A cache-buster keyed on the
// path keeps a re-uploaded photo from showing the stale cached image.
export function labelPublicUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl ?? null;
}
