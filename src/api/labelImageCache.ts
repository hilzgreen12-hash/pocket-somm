import { Directory, File, Paths } from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
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
//
// The cache lives in Paths.document (Android purges Paths.cache under storage
// pressure, which made labels re-download after a quiet week) and is held to
// MAX_BYTES by least-recently-used eviction, so it can't fill the phone. Each
// image also gets a small THUMB_WIDTH thumbnail on first use, for grids, rows
// and carousel tiles that would otherwise decode the full 1000px upload.

const BUCKET = 'wine-labels'; // must match labelPhotos.ts
const CACHE_DIR = new Directory(Paths.document, 'label-images');
// Pre-2026-11 location; its files are moved across once (see loadIndex).
const LEGACY_DIR = new Directory(Paths.cache, 'label-images');
const INDEX_FILE = new File(CACHE_DIR, 'index.json');

const MAX_BYTES = 300 * 1024 * 1024;
// Evict down to this, so one new image doesn't trigger an eviction pass each time.
const EVICT_TO_BYTES = 240 * 1024 * 1024;
// Never evict an image used this recently — it's likely still on screen.
const EVICT_GRACE_MS = 10 * 60 * 1000;
// The largest thumbnail use is a ~190pt carousel tile; 480px keeps that crisp
// on most phones while being ~4x fewer pixels to decode than the 1000px upload.
export const THUMB_WIDTH = 480;
// Downloads and thumbnail renders run at most this many at a time, so a
// 100-slot rack (or a background warm-up) can't flood the network or CPU.
const MAX_CONCURRENT = 4;
const SIGNED_URL_TIMEOUT_MS = 8000;

// One index entry per cached image, keyed by the flattened storage path.
// `v` is the retake version: upload paths are deterministic (userId/wineId.jpg),
// so a retake overwrites the same storage path — and images are cached in
// memory by URI STRING, so reusing the same file:// URI would keep showing the
// stale label in already-rendered instances. Bumping a version (and writing to
// a versioned filename) makes the resolved URI genuinely change on a retake.
// Persisted in the index so the right file is found after a restart.
type Entry = { v: number; used: number; bytes: number };
let index: Record<string, Entry> | null = null;
let indexLoad: Promise<Record<string, Entry>> | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

// Paths look like "userId/wineId.jpg" or "userId/locations/id.jpg"; flatten the
// slashes to a single safe filename.
function keyFor(path: string): string {
  return path.replace(/[^a-zA-Z0-9._-]/g, '_');
}
// v0 keeps the bare name, so files cached before versioning still match.
function fullFile(key: string, v: number): File {
  return new File(CACHE_DIR, v > 0 ? `${key}__v${v}` : key);
}
function thumbFile(key: string, v: number): File {
  return new File(CACHE_DIR, `${v > 0 ? `${key}__v${v}` : key}__thumb.jpg`);
}
const SUPERSEDED = Symbol('superseded');
const FILE_NAME = /^(.*?)(?:__v(\d+))?(__thumb\.jpg)?$/;

function ensureDir() {
  try { if (!CACHE_DIR.exists) CACHE_DIR.create({ intermediates: true }); } catch { /* already exists */ }
}
function sizeOf(f: File): number {
  try { return f.exists ? f.size : 0; } catch { return 0; }
}
function remove(f: File) {
  try { if (f.exists) f.delete(); } catch { /* best-effort */ }
}

// Index ----------------------------------------------------------------------

function loadIndex(): Promise<Record<string, Entry>> {
  if (index) return Promise.resolve(index);
  if (!indexLoad) {
    indexLoad = (async () => {
      ensureDir();
      migrateLegacy();
      let loaded: Record<string, Entry> | null = null;
      try { if (INDEX_FILE.exists) loaded = JSON.parse(await INDEX_FILE.text()); } catch { /* rebuilt below */ }
      index = loaded ?? rebuildIndex();
      if (!loaded) scheduleSave();
      return index;
    })();
  }
  return indexLoad;
}

// Move the old Paths.cache files into the persistent dir (only bare v0 names —
// older retake versions are stale), then drop the old dir. Anything that
// fails just re-downloads on next use.
function migrateLegacy() {
  try {
    if (!LEGACY_DIR.exists) return;
    for (const item of LEGACY_DIR.list()) {
      if (!(item instanceof File) || item.name.includes('__v')) continue;
      const dest = new File(CACHE_DIR, item.name);
      try { if (!dest.exists) item.move(dest); } catch { /* re-downloads later */ }
    }
    LEGACY_DIR.delete();
  } catch { /* best-effort */ }
}

// No index yet (first run, or it was lost): rebuild it from the files on disk,
// keeping only the newest version of each image.
function rebuildIndex(): Record<string, Entry> {
  const next: Record<string, Entry> = {};
  const files: { key: string; v: number; file: File }[] = [];
  try {
    for (const item of CACHE_DIR.list()) {
      if (!(item instanceof File) || item.name === 'index.json' || item.name.endsWith('.part')) continue;
      const m = FILE_NAME.exec(item.name);
      if (!m) continue;
      const v = m[2] ? Number(m[2]) : 0;
      files.push({ key: m[1], v, file: item });
      if (!next[m[1]] || next[m[1]].v < v) next[m[1]] = { v, used: item.modificationTime ?? Date.now(), bytes: 0 };
    }
  } catch { /* empty index */ }
  for (const { key, v, file } of files) {
    if (next[key].v === v) next[key].bytes += sizeOf(file);
    else remove(file);
  }
  return next;
}

function saveNow() {
  if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
  if (!index) return;
  try { ensureDir(); INDEX_FILE.write(JSON.stringify(index)); } catch { /* next change retries */ }
}
function scheduleSave() {
  if (!saveTimer) saveTimer = setTimeout(saveNow, 2000);
}

// Mark an image as just used. A file the index doesn't know (the app was
// closed before the index was saved) is adopted, so it stays evictable.
function touch(key: string, file: File) {
  if (!index) return;
  const e = index[key];
  if (e) e.used = Date.now();
  else index[key] = { v: 0, used: Date.now(), bytes: sizeOf(file) };
  scheduleSave();
}

// Drop least-recently-used images until the cache is back under budget.
function evictIfNeeded() {
  if (!index) return;
  let total = 0;
  for (const e of Object.values(index)) total += e.bytes;
  if (total <= MAX_BYTES) return;
  const cutoff = Date.now() - EVICT_GRACE_MS;
  const oldest = Object.entries(index).filter(([, e]) => e.used < cutoff).sort((a, b) => a[1].used - b[1].used);
  for (const [key, e] of oldest) {
    if (total <= EVICT_TO_BYTES) break;
    remove(fullFile(key, e.v));
    remove(thumbFile(key, e.v));
    total -= e.bytes;
    delete index[key];
  }
  scheduleSave();
}

// Concurrency ----------------------------------------------------------------

// A tiny two-lane limiter: on-screen requests jump ahead of background warm-up.
let running = 0;
const queues: Record<'fg' | 'bg', (() => void)[]> = { fg: [], bg: [] };
function pump() {
  while (running < MAX_CONCURRENT) {
    const next = queues.fg.shift() ?? queues.bg.shift();
    if (!next) return;
    running++;
    next();
  }
}
function limited<T>(task: () => Promise<T>, background: boolean): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    queues[background ? 'bg' : 'fg'].push(() => {
      task().then(resolve, reject).finally(() => { running--; pump(); });
    });
    pump();
  });
}

// Requests for the same image (a tile and a warm-up, say) share one download.
const inflight = new Map<string, Promise<unknown>>();
function once<T>(id: string, work: () => Promise<T>): Promise<T> {
  const existing = inflight.get(id) as Promise<T> | undefined;
  if (existing) return existing;
  const p = work().finally(() => inflight.delete(id));
  inflight.set(id, p);
  return p;
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([p, new Promise<null>((r) => setTimeout(() => r(null), ms))]);
}

// Public API -----------------------------------------------------------------

export type LabelCacheOptions = { background?: boolean };

// Local file:// URI for a label image, downloading it once if not already
// cached. Returns null when there's no path; on a download failure it falls
// back to the signed URL so the image still loads over the network this once.
export async function getCachedLabelUri(path: string | null | undefined, opts: LabelCacheOptions = {}): Promise<string | null> {
  if (!path) return null;
  const idx = await loadIndex();
  const key = keyFor(path);
  const cached = fullFile(key, idx[key]?.v ?? 0);
  try {
    if (cached.exists) { touch(key, cached); return cached.uri; }
  } catch { /* fall through to download */ }

  return once(`full:${key}`, () => limited(async () => {
    const res = await withTimeout(supabase.storage.from(BUCKET).createSignedUrl(path, 3600), SIGNED_URL_TIMEOUT_MS);
    const signed = res && !res.error ? (res.data?.signedUrl ?? null) : null;
    if (!signed) return null;
    const v = idx[key]?.v ?? 0;
    const dest = fullFile(key, v);
    // Download beside the final name, then move — a half-written file is never served.
    const part = new File(CACHE_DIR, `${dest.name}.part`);
    try {
      ensureDir();
      remove(part);
      await File.downloadFileAsync(signed, part);
      // A retake landed while we downloaded: its primed file wins.
      if ((idx[key]?.v ?? 0) !== v || dest.exists) { remove(part); return fullFile(key, idx[key]?.v ?? 0).uri; }
      part.move(dest);
      idx[key] = { v, used: Date.now(), bytes: sizeOf(dest) };
      scheduleSave();
      evictIfNeeded();
      return dest.uri;
    } catch {
      remove(part);
      return signed;
    }
  }, !!opts.background));
}

// Small (THUMB_WIDTH) local thumbnail for a label image, made from the cached
// full image on first use. Falls back to whatever getCachedLabelUri returned
// (a signed URL when offline-ish, or null) when no local full image exists.
export async function getCachedLabelThumbUri(path: string | null | undefined, opts: LabelCacheOptions = {}): Promise<string | null> {
  if (!path) return null;
  const full = await getCachedLabelUri(path, opts);
  if (!full || !full.startsWith('file:')) return full;
  const idx = await loadIndex();
  const key = keyFor(path);
  const v = idx[key]?.v ?? 0;
  const thumb = thumbFile(key, v);
  try { if (thumb.exists) return thumb.uri; } catch { /* regenerate */ }

  const made = await once(`thumb:${key}:${v}`, () => limited(async () => {
    try {
      const out = await manipulateAsync(full, [{ resize: { width: THUMB_WIDTH } }], { compress: 0.7, format: SaveFormat.JPEG });
      const rendered = new File(out.uri);
      // Retaken or evicted meanwhile: this thumbnail is for a file that's gone.
      if (!idx[key] || idx[key].v !== v) { remove(rendered); return SUPERSEDED; }
      remove(thumb);
      rendered.move(thumb);
      idx[key].bytes += sizeOf(thumb);
      scheduleSave();
      evictIfNeeded();
      return thumb.uri;
    } catch {
      return full; // the full image still shows — just decoded at full size
    }
  }, !!opts.background));
  // Resolved outside the limiter so a re-download can't wait on its own slot.
  return made === SUPERSEDED ? getCachedLabelThumbUri(path, opts) : made;
}

// Prime the cache with freshly-uploaded bytes (the same path the bucket stores),
// so the uploading device serves the new image immediately. A retake bumps the
// version → a fresh versioned filename → the resolved file:// URI changes, so
// already-rendered images re-decode instead of showing the stale label. The
// previous version's full image and thumbnail are dropped so retakes don't
// accrete on disk; the new thumbnail is made on next use.
export function primeCachedLabel(path: string, bytes: Uint8Array): void {
  const apply = (idx: Record<string, Entry>) => {
    try {
      ensureDir();
      const key = keyFor(path);
      const prev = idx[key]?.v ?? 0;
      const next = prev + 1;
      const dest = fullFile(key, next);
      remove(dest);
      try { dest.create(); } catch { /* write may create it itself */ }
      dest.write(bytes);
      remove(fullFile(key, prev));
      remove(thumbFile(key, prev));
      idx[key] = { v: next, used: Date.now(), bytes: bytes.byteLength };
      // Saved at once: a retake's version must survive the app closing, or
      // the next launch would look for the old file.
      saveNow();
      evictIfNeeded();
    } catch { /* best-effort */ }
  };
  // Synchronous once the index is loaded, so a caller's follow-up
  // invalidation already sees the new file.
  if (index) apply(index); else void loadIndex().then(apply);
}

// Drop a cached copy (e.g. after the underlying image is deleted) so deleted
// wines/locations don't leave their label bytes on disk forever.
export function evictCachedLabel(path: string | null | undefined): void {
  if (!path) return;
  const apply = (idx: Record<string, Entry>) => {
    const key = keyFor(path);
    const v = idx[key]?.v ?? 0;
    remove(fullFile(key, v));
    remove(thumbFile(key, v));
    delete idx[key];
    scheduleSave();
  };
  if (index) apply(index); else void loadIndex().then(apply);
}
