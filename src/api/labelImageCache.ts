import { Directory, File, Paths } from 'expo-file-system';
import { supabase } from './supabase';

// Local on-disk cache for private-bucket label images.
//
// Label photos live in Supabase Storage behind short-lived SIGNED URLs whose
// token changes on every mint — so without a local copy, each screen re-mints a
// URL and re-downloads the image, and the label flickers/reloads on every
// visit. Here we download each image ONCE, keyed by its STABLE storage path,
// and serve a file:// URI thereafter: instant on repeat visits and app
// restarts, and it works offline. The signed-URL token no longer matters
// because we cache by path, not by URL. Uploads prime this cache with the exact
// bytes they store, so a retake stays correct with no extra network.

const BUCKET = 'wine-labels'; // must match labelPhotos.ts
const CACHE_DIR = new Directory(Paths.cache, 'label-images');

function ensureDir() {
  try { if (!CACHE_DIR.exists) CACHE_DIR.create({ intermediates: true }); } catch { /* already exists */ }
}

// One cache file per storage path. Paths look like "userId/wineId.jpg" or
// "userId/locations/id.jpg"; flatten the slashes to a single safe filename.
function fileFor(path: string): File {
  return new File(CACHE_DIR, path.replace(/[^a-zA-Z0-9._-]/g, '_'));
}

function writeBytes(file: File, bytes: Uint8Array) {
  try { if (file.exists) file.delete(); } catch { /* ignore */ }
  try { file.create(); } catch { /* write may create it itself */ }
  file.write(bytes);
}

// Local file:// URI for a label image, downloading it once if not already
// cached. Returns null when there's no path; on a fetch failure it falls back
// to the signed URL so the image still loads over the network this once.
export async function getCachedLabelUri(path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  ensureDir();
  const file = fileFor(path);
  try { if (file.exists) return file.uri; } catch { /* fall through to download */ }

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  const signed = error ? null : (data?.signedUrl ?? null);
  if (!signed) return null;
  try {
    const res = await fetch(signed);
    if (!res.ok) return signed;
    const buf = await res.arrayBuffer();
    writeBytes(file, new Uint8Array(buf));
    return file.uri;
  } catch {
    return signed;
  }
}

// Prime the cache with freshly-uploaded bytes (the same path the bucket stores),
// so the uploading device serves the new image immediately — and a retake to an
// existing path overwrites the stale local copy rather than showing it.
export function primeCachedLabel(path: string, bytes: Uint8Array): void {
  try { ensureDir(); writeBytes(fileFor(path), bytes); } catch { /* best-effort */ }
}

// Drop a cached copy (e.g. after the underlying image is deleted).
export function evictCachedLabel(path: string | null | undefined): void {
  if (!path) return;
  try { const f = fileFor(path); if (f.exists) f.delete(); } catch { /* best-effort */ }
}
