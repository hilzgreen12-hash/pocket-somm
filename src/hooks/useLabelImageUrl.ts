import { useQuery } from '@tanstack/react-query';
import { labelSignedUrl } from '../api/labelPhotos';

// How long a minted signed URL stays valid (see labelSignedUrl's default).
const SIGNED_URL_TTL_MS = 60 * 60 * 1000; // 1 hour

// Resolves a stored label path to a short-lived signed URL.
//
// Cached via react-query keyed by path so the SAME signed URL is reused
// across navigations. This matters a lot for the rack grid: a freshly
// minted signed URL has a new token each call, so re-minting on every mount
// changed the Image uri every time → React Native's image cache never hit →
// every thumbnail re-downloaded and the cellar flashed blank on each visit.
// Caching the URL keeps the uri stable, so the image cache serves instantly.
// staleTime sits just under the token TTL so we refresh before it expires.
export function useLabelImageUrl(path: string | null | undefined): string | null {
  const { data } = useQuery({
    queryKey: ['label-url', path],
    queryFn: () => labelSignedUrl(path),
    enabled: !!path,
    staleTime: SIGNED_URL_TTL_MS - 10 * 60 * 1000, // 50 min — refresh before the 60 min token expires
    gcTime: SIGNED_URL_TTL_MS,
    retry: 1,
  });
  return data ?? null;
}
