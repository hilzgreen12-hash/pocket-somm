import { AppState } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';
import * as Application from 'expo-application';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { persistQueryClientRestore, persistQueryClientSave, type PersistQueryClientOptions, type Persister } from '@tanstack/react-query-persist-client';
import type { Query, QueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import { getCellarContext } from './cellarContext';

// Keeps the last-known lists, carousels and storage grids on disk, so on open
// they draw at once from what the user saw last time and then refresh in the
// background (restored data is older than staleTime, so every mounted query
// refetches as usual). Only read queries that feed something visible are
// kept; never mutations.
//
// One file per signed-in user (Paths.document/query-cache/<userId>.json). A
// file rather than AsyncStorage: a big cellar can serialise to megabytes,
// past what an Android AsyncStorage row reads back. Writes go only to the
// current user's file and are dropped once the user has changed, and the
// file is deleted on sign-out, account switch and shared-cellar switch (see
// useAuth).

const WEEK = 7 * 24 * 60 * 60 * 1000;
// Saves are batched: at most one every SAVE_EVERY_MS, however busy the cache.
const SAVE_EVERY_MS = 2000;
const RESTORE_TIMEOUT_MS = 3000;

// Query-key prefixes that are persisted.
const PERSISTED_KEYS = [
  // Cellar lists and every home-storage screen (racks/fridges, bins, alt cellars, Cellar-tab tiles)
  'cellar', 'cellar-archive', 'cellar-locations', 'placements-list',
  'racks', 'rack-slots', 'slot-assignments', 'bins', 'bin-cells',
  'storage-locations', 'storage-location', 'storage-location-wines', 'storage-location-cases', 'home-storage-thumbs',
  // Review / Scan / Home carousels
  'chosen-wines', 'scan-archive', 'labels', 'lineup-archives',
  'insights-archived-month', 'insights-restos-month', 'latest-alter-ego-sketch', 'alter-ego-sketches',
  'cellar-locations-ext', 'home-insights-placements',
  'where-to-buy-recent',
  // Pair tab cookbook carousel
  'chef-archive-collections', 'cookbook-favourites-cover', 'chef-label-sessions',
  // Image look-ups: cached file:// uris and web-found labels (saves a paid search per tile per open)
  'label-image', 'auto-label',
  'journal-feed',
] as const;
const PERSISTED = new Set<string>(PERSISTED_KEYS);

// A list this long (a huge imported cellar) would make every save slow, so it
// is left to load from the network as before.
const MAX_ROWS = 2000;

// Lists that can run to thousands of rows (a full Vivino import is ~9,000
// reviews, ~12 MB). Each is kept in a file of its own, written only when that
// list changes, so the main file stays small and quick to save.
const BIG_KEYS = new Set<string>(['chosen-wines', 'cellar', 'cellar-archive']);
const BIG_SAVE_DELAY_MS = 3000;

function shouldPersist(query: Query): boolean {
  if (BIG_KEYS.has(String(query.queryKey[0]))) return false;
  if (query.state.status !== 'success' || !PERSISTED.has(String(query.queryKey[0]))) return false;
  const data = query.state.data;
  // A label image is only worth keeping as a local file — a signed-URL
  // fallback expires within the hour.
  if (query.queryKey[0] === 'label-image') return typeof data === 'string' && data.startsWith('file:');
  if (Array.isArray(data) && data.length > MAX_ROWS) return false;
  return query.queryHash.length < 20_000;
}

// Persisted queries must outlive the default 5-minute gcTime, or anything not
// on screen would be dropped from memory — and so from the next save.
export function configurePersistedQueries(qc: QueryClient): void {
  for (const key of PERSISTED_KEYS) qc.setQueryDefaults([key], { gcTime: WEEK });
}

// File storage --------------------------------------------------------------

const DIR = new Directory(Paths.document, 'query-cache');
const fileFor = (userId: string) => new File(DIR, `${userId}.json`);
const bigFileFor = (userId: string, key: string) => new File(DIR, `${userId}.big.${key}.json`);
const ownsFile = (userId: string, name: string) => name === `${userId}.json` || name.startsWith(`${userId}.big.`);

// Whose cache is live. null = persistence paused (signed out, mid-switch).
let activeUserId: string | null = null;
// The user whose cache was restored at launch (before auth has settled).
let restoredUserId: string | null = null;

// AsyncStorage-shaped adapter; the persister's `key` is the user id.
const storage = {
  getItem: async (userId: string) => {
    const f = fileFor(userId);
    return f.exists ? f.text() : null;
  },
  setItem: async (userId: string, value: string) => {
    // A throttled save queued before a sign-out or switch must not land.
    if (userId !== activeUserId) return;
    if (!DIR.exists) DIR.create({ intermediates: true });
    fileFor(userId).write(value);
  },
  removeItem: async (userId: string) => {
    try { const f = fileFor(userId); if (f.exists) f.delete(); } catch { /* best-effort */ }
    try {
      if (DIR.exists) for (const item of DIR.list()) {
        if (item instanceof File && item.name.startsWith(`${userId}.big.`)) item.delete();
      }
    } catch { /* best-effort */ }
    // The big-list files are gone: forget what they held, or saveBigList would
    // skip rewriting an unchanged list (the same array) and leave it unsaved
    // until it next changes — a cold start would re-download all of it.
    forgetBigSaves(userId);
  },
};

const persisters = new Map<string, Persister>();
function persisterFor(userId: string): Persister {
  let p = persisters.get(userId);
  if (!p) {
    // No extra throttle: saves are already batched (subscribePersistedQueries),
    // and the flush on backgrounding must write at once.
    p = createAsyncStoragePersister({ storage, key: userId, throttleTime: 0 });
    persisters.set(userId, p);
  }
  return p;
}

const persister: Persister = {
  persistClient: async (client) => {
    const userId = activeUserId;
    // Not until this user's cellar context has loaded: until then cellar reads
    // can briefly come from the wrong cellar (shared-cellar members).
    if (!userId || getCellarContext().userId !== userId) return;
    await persisterFor(userId).persistClient(client);
  },
  restoreClient: async () => {
    const { data } = await supabase.auth.getSession();
    restoredUserId = data.session?.user.id ?? null;
    return restoredUserId ? persisterFor(restoredUserId).restoreClient() : undefined;
  },
  // Called by the restore when the saved cache is expired, from an older
  // build, or unreadable.
  removeClient: async () => {
    const userId = activeUserId ?? restoredUserId;
    if (userId) await storage.removeItem(userId);
  },
};

const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister,
  maxAge: WEEK,
  // A new build may change what a query returns — start fresh after updates.
  buster: `${Application.nativeApplicationVersion ?? ''}-${Application.nativeBuildVersion ?? ''}`,
  dehydrateOptions: { shouldDehydrateQuery: shouldPersist, shouldDehydrateMutation: () => false },
};

// Point saves at this user's file (null pauses saving). Other users' files are
// deleted — only the signed-in user's cache is ever kept on the device.
export function setPersistedQueryUser(userId: string | null): void {
  activeUserId = userId;
  if (!userId) return;
  try {
    if (!DIR.exists) return;
    for (const item of DIR.list()) {
      if (item instanceof File && !ownsFile(userId, item.name)) item.delete();
    }
  } catch { /* best-effort */ }
}

// Delete a user's saved cache (sign-out, account or shared-cellar switch).
export function clearPersistedQueries(userId: string): void {
  void storage.removeItem(userId);
}

// Save now, for when saving resumes after a pause with no further cache
// change guaranteed to trigger one.
export function savePersistedQueries(qc: QueryClient): void {
  void persistQueryClientSave({ ...persistOptions, queryClient: qc }).catch(() => {});
}

// Load the saved cache into the client (launch only). Queries wait for this,
// so a wedged read (getSession can hang on a bad connection) is cut off and
// the app simply starts cold.
export function restorePersistedQueries(qc: QueryClient): Promise<void> {
  const restore = persistQueryClientRestore({ ...persistOptions, queryClient: qc })
    .catch(() => {})
    .then(() => restoreBigLists(qc));
  return Promise.race([restore, new Promise<void>((r) => setTimeout(r, RESTORE_TIMEOUT_MS))]);
}

// Big lists ------------------------------------------------------------------

const lastBigSave = new Map<string, unknown>();

// Big-list query keys are [key, userId], so their hashes carry the user id.
function forgetBigSaves(userId: string): void {
  for (const hash of [...lastBigSave.keys()]) if (hash.includes(`"${userId}"`)) lastBigSave.delete(hash);
}

// Write every big list held for the active user now (skipping any already on
// disk) — for when saving resumes after its files were deleted (a cellar
// switch), since an unchanged list would otherwise not be saved again.
export function saveBigListsNow(qc: QueryClient): void {
  for (const key of BIG_KEYS) {
    for (const query of qc.getQueryCache().findAll({ queryKey: [key] })) saveBigList(query);
  }
}

interface BigListFile { buster: string; savedAt: number; queryKey: unknown[]; data: unknown }

// Read this user's big-list files back into the cache. They are restored as
// already-stale data, so the screen draws at once and then syncs.
async function restoreBigLists(qc: QueryClient): Promise<void> {
  const userId = restoredUserId;
  if (!userId) return;
  for (const key of BIG_KEYS) {
    const f = bigFileFor(userId, key);
    try {
      if (!f.exists) continue;
      const saved = JSON.parse(await f.text()) as BigListFile;
      const fresh = saved.buster === persistOptions.buster && Date.now() - saved.savedAt < WEEK;
      const k = saved.queryKey;
      // Only this user's list, from this build, and never over newer data.
      if (!fresh || !Array.isArray(k) || k[0] !== key || k[1] !== userId || qc.getQueryData(k) !== undefined) {
        if (!fresh) f.delete();
        continue;
      }
      qc.setQueryData(k, saved.data, { updatedAt: saved.savedAt });
      // Already on disk: no need to write it again until it changes.
      const hash = qc.getQueryCache().find({ queryKey: k, exact: true })?.queryHash;
      if (hash) lastBigSave.set(hash, qc.getQueryData(k));
    } catch {
      try { f.delete(); } catch { /* best-effort */ }
    }
  }
}

// Write a big list to its own file. Skipped when the data is the same array
// as last time (a sync that found nothing new).
function saveBigList(query: Query): void {
  const key = String(query.queryKey[0]);
  const userId = activeUserId;
  const data = query.state.data;
  if (query.state.status !== 'success' || !Array.isArray(data)) return;
  if (!userId || query.queryKey[1] !== userId || getCellarContext().userId !== userId) return;
  if (lastBigSave.get(query.queryHash) === data) return;
  try {
    if (!DIR.exists) DIR.create({ intermediates: true });
    const payload: BigListFile = { buster: persistOptions.buster ?? '', savedAt: query.state.dataUpdatedAt, queryKey: [...query.queryKey], data };
    bigFileFor(userId, key).write(JSON.stringify(payload));
    lastBigSave.set(query.queryHash, data);
  } catch { /* best-effort: the list still loads from the network */ }
}

// Save after cache changes. The stock subscriber snapshots the WHOLE cache on
// every event before throttling — hundreds of times while a 900-slot rack
// mounts — so here the timer comes first and the snapshot is taken once per
// batch. Pending changes are flushed when the app goes to the background.
export function subscribePersistedQueries(qc: QueryClient): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const flush = () => {
    if (timer) { clearTimeout(timer); timer = null; }
    savePersistedQueries(qc);
  };
  // Big lists save on their own timer, only after they themselves change.
  const bigTimers = new Map<string, { timer: ReturnType<typeof setTimeout>; query: Query }>();
  const flushBig = () => {
    for (const { timer: t, query } of bigTimers.values()) { clearTimeout(t); saveBigList(query); }
    bigTimers.clear();
  };
  const unsubCache = qc.getQueryCache().subscribe((event) => {
    if (event.type !== 'added' && event.type !== 'removed' && event.type !== 'updated') return;
    if (BIG_KEYS.has(String(event.query.queryKey[0]))) {
      if (event.type !== 'updated' || bigTimers.has(event.query.queryHash)) return;
      const query = event.query;
      bigTimers.set(query.queryHash, {
        query,
        timer: setTimeout(() => { bigTimers.delete(query.queryHash); saveBigList(query); }, BIG_SAVE_DELAY_MS),
      });
      return;
    }
    if (timer) return;
    timer = setTimeout(flush, SAVE_EVERY_MS);
  });
  const appState = AppState.addEventListener('change', (state) => {
    if (state === 'active') return;
    if (timer) flush();
    if (bigTimers.size) flushBig();
  });
  return () => {
    unsubCache();
    appState.remove();
    if (timer) clearTimeout(timer);
    for (const { timer: t } of bigTimers.values()) clearTimeout(t);
  };
}
