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

function shouldPersist(query: Query): boolean {
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
      if (item instanceof File && item.name !== `${userId}.json`) item.delete();
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
  const restore = persistQueryClientRestore({ ...persistOptions, queryClient: qc }).catch(() => {});
  return Promise.race([restore, new Promise<void>((r) => setTimeout(r, RESTORE_TIMEOUT_MS))]);
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
  const unsubCache = qc.getQueryCache().subscribe((event) => {
    if (timer || (event.type !== 'added' && event.type !== 'removed' && event.type !== 'updated')) return;
    timer = setTimeout(flush, SAVE_EVERY_MS);
  });
  const appState = AppState.addEventListener('change', (state) => { if (state !== 'active' && timer) flush(); });
  return () => {
    unsubCache();
    appState.remove();
    if (timer) clearTimeout(timer);
  };
}
