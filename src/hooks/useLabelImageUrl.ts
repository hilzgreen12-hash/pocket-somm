import { useEffect } from 'react';
import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { getCachedLabelUri, getCachedLabelThumbUri, evictCachedLabel } from '../api/labelImageCache';

// 'full' = the stored 1000px image (heroes, photo viewers, share cards);
// 'thumb' = its small cached thumbnail (grid slots, list rows, carousel tiles).
export type LabelImageSize = 'full' | 'thumb';

const isRemote = (path: string | null | undefined) => !!path && /^https?:\/\//i.test(path);

// Thumb keys extend the full key, so invalidating ['label-image', path] after a
// retake refreshes both.
export function labelImageQuery(path: string, size: LabelImageSize = 'full', background = false) {
  return {
    queryKey: size === 'thumb' ? ['label-image', path, 'thumb'] : ['label-image', path],
    queryFn: () => (size === 'thumb' ? getCachedLabelThumbUri : getCachedLabelUri)(path, { background }),
    staleTime: 60 * 1000,
    retry: 1,
  };
}

// Resolves a stored label path to a LOCAL file:// URI, downloading the image
// once and caching it on disk (see labelImageCache). Returns the same stable
// URI on every visit, so:
//   * repeat navigations and app restarts show the label instantly (served from
//     disk — no signed-URL mint, no re-download, no reload flicker),
//   * it works offline once cached.
//
// The name is kept (callers unchanged) even though it now returns a file:// URI
// rather than a signed URL — both are valid image source uris. Because the
// URI is derived from the stable storage path (not the volatile signed-URL
// token), react-query refetches can never change it, so the image never
// re-mounts. staleTime is short only so a rare retake reflects promptly; the
// re-run is a cheap local exists() check that returns the cached URI with no
// network.
// Full state for a stored label path: the resolved uri plus whether it's still
// being resolved (downloaded + disk-cached). `pending` lets a caller distinguish
// "the user's own photo is on its way — wait for it" from "there is no stored
// photo" — so it never flashes a web-fetched stand-in over a photo that's about
// to arrive.
export function useLabelImageState(path: string | null | undefined, size: LabelImageSize = 'full'): { uri: string | null; pending: boolean } {
  // Imported reviews (e.g. Vivino) store a remote https label URL rather than a
  // Supabase storage path — render it directly instead of routing through the
  // storage-path cache.
  const remote = isRemote(path);
  const enabled = !!path && !remote;
  const { data, status } = useQuery({ ...labelImageQuery(path ?? '', size), enabled });
  if (remote) return { uri: path as string, pending: false };
  // Still fetching the stored photo for the first time (no data, not yet errored).
  const pending = enabled && status === 'pending';
  return { uri: data ?? null, pending };
}

export function useLabelImageUrl(path: string | null | undefined): string | null {
  return useLabelImageState(path).uri;
}

// Small-thumbnail variant for grids, rows and carousel tiles.
export function useLabelThumbUri(path: string | null | undefined): string | null {
  return useLabelImageState(path, 'thumb').uri;
}

// A resolved file that won't draw — evicted while a restored cache still
// pointed at it, or damaged: drop it and resolve again (re-downloading).
// Resetting (not just invalidating) unmounts the broken image so the fresh
// file is actually loaded. Once per path per session, so a bad file can't loop.
const repaired = new Set<string>();
export function repairLabelImage(qc: QueryClient, path: string | null | undefined): void {
  if (!path || isRemote(path) || repaired.has(path)) return;
  repaired.add(path);
  evictCachedLabel(path);
  void qc.resetQueries({ queryKey: ['label-image', path] });
}

// Background warm-up -----------------------------------------------------------

// Paths already warmed this session — repeat calls (every screen that reads the
// cellar, say) cost nothing.
const warmed = new Set<string>();

// Make thumbnails for the first `max` stored photos in a list that just
// arrived, so the tiles are ready before the user scrolls or opens the screen.
// Runs on the cache's background lane (on-screen tiles go first) and never
// blocks the UI.
export function warmLabelThumbs(qc: QueryClient, paths: readonly (string | null | undefined)[], max = 24): void {
  let n = 0;
  for (const p of paths) {
    if (n >= max) break;
    if (!p || isRemote(p)) continue;
    n++;
    if (warmed.has(p)) continue;
    warmed.add(p);
    void qc.prefetchQuery(labelImageQuery(p, 'thumb', true));
  }
}

// Hook form of warmLabelThumbs for a list that just arrived: `pathOf` picks
// each item's stored photo. Re-runs only when the leading paths change, and
// only scans as far as the first `max` photos (cellars run to thousands).
export function useWarmLabelThumbs<T>(items: readonly T[] | undefined, pathOf: (item: T) => string | null | undefined, max = 24): void {
  const qc = useQueryClient();
  const lead: string[] = [];
  for (const item of items ?? []) {
    if (lead.length >= max) break;
    const p = pathOf(item);
    if (p && !isRemote(p)) lead.push(p);
  }
  const sig = lead.join('\n');
  useEffect(() => {
    if (sig) warmLabelThumbs(qc, sig.split('\n'), max);
  }, [qc, sig, max]);
}
