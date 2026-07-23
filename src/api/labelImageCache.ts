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

// Per-path retake counter. Upload paths are deterministic (userId/wineId.jpg),
// so a retake overwrites the same storage path — and React Native's <Image>
// caches decoded bitmaps by URI STRING, so reusing the same file:// URI would
// keep showing the stale label in already-rendered instances. Bumping a version
// (and writing to a versioned filename) makes the resolved URI genuinely change
// on a retake, so <Image> re-decodes. In-memory only: on a fresh app start we
// fall back to the base (v0) filename and re-download once if needed.
const versions = new Map<string, number>();

function ensureDir() {
  try { if (!CACHE_DIR.exists) CACHE_DIR.create({ intermediates: true }); } catch { /* already exists */ }
}

// One cache file per storage path (+ retake version). Paths look like
// "userId/wineId.jpg" or "userId/locations/id.jpg"; flatten the slashes to a
// single safe filename. v0 keeps the bare name for backward-compatible reads of
// files cached before versioning existed.
function fileFor(path: string, version = 0): File {
  const safe = path.replace(/[^a-zA-Z0-9._-]/g, '_');
  return new File(CACHE_DIR, version > 0 ? `${safe}__v${version}` : safe);
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
  const file = fileFor(path, versions.get(path) ?? 0);
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
// so the uploading device serves the new image immediately. A retake bumps the
// version → a fresh versioned filename → the resolved file:// URI changes, so
// already-rendered <Image>s re-decode instead of showing the stale label. The
// previous version's file is dropped so retakes don't accrete on disk.
export function primeCachedLabel(path: string, bytes: Uint8Array): void {
  try {
    ensureDir();
    const prev = versions.get(path) ?? 0;
    const next = prev + 1;
    writeBytes(fileFor(path, next), bytes);
    try { const old = fileFor(path, prev); if (old.exists) old.delete(); } catch { /* best-effort */ }
    versions.set(path, next);
  } catch { /* best-effort */ }
}

// Drop a cached copy (e.g. after the underlying image is deleted) so deleted
// wines/locations don't leave their label bytes on disk forever.
export function evictCachedLabel(path: string | null | undefined): void {
  if (!path) return;
  try { const f = fileFor(path, versions.get(path) ?? 0); if (f.exists) f.delete(); } catch { /* best-effort */ }
  versions.delete(path);
}
