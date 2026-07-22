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
export function useLabelImageUrl(path: string | null | undefined): string | null {
  const { data } = useQuery({
    queryKey: ['label-image', path],
    queryFn: () => getCachedLabelUri(path),
    enabled: !!path,
    staleTime: 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
  return data ?? null;
}
