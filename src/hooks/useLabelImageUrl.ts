import { useQuery } from '@tanstack/react-query';
import { getCachedLabelUri } from '../api/labelImageCache';

// Resolves a stored label path to a LOCAL file:// URI, downloading the image
// once and caching it on disk (see labelImageCache). Returns the same stable
// URI on every visit, so:
//   * repeat navigations and app restarts show the label instantly (served from
//     disk — no signed-URL mint, no re-download, no reload flicker),
//   * it works offline once cached.
//
// The name is kept (callers unchanged) even though it now returns a file:// URI
// rather than a signed URL — both are valid <Image> source uris. Because the
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
export function useLabelImageState(path: string | null | undefined): { uri: string | null; pending: boolean } {
  // Imported reviews (e.g. Vivino) store a remote https label URL rather than a
  // Supabase storage path — render it directly instead of routing through the
  // storage-path cache.
  const isRemote = !!path && /^https?:\/\//i.test(path);
  const enabled = !!path && !isRemote;
  const { data, status } = useQuery({
    queryKey: ['label-image', path],
    queryFn: () => getCachedLabelUri(path),
    enabled,
    staleTime: 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
  if (isRemote) return { uri: path as string, pending: false };
  // Still fetching the stored photo for the first time (no data, not yet errored).
  const pending = enabled && status === 'pending';
  return { uri: data ?? null, pending };
}

export function useLabelImageUrl(path: string | null | undefined): string | null {
  return useLabelImageState(path).uri;
}
