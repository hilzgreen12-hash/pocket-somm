import { useQuery } from '@tanstack/react-query';
import { fetchAutoLabelUri } from '../api/label';

// A web-fetched label photo for a wine identity, cached by (producer|wineName)
// for a day. Only runs when `enabled` (i.e. the card has no stored image) and
// there's an identity to search on. Best-effort — returns null on a miss so the
// caller can fall back to a name tile. Used to keep Discover carousel cards from
// ever showing a blank thumbnail.
export function useAutoLabel(
  producer: string | null | undefined,
  wineName: string | null | undefined,
  enabled: boolean,
): string | null {
  const p = (producer ?? '').trim();
  const w = (wineName ?? '').trim();
  const { data } = useQuery({
    queryKey: ['auto-label', `${p.toLowerCase()}|${w.toLowerCase()}`],
    queryFn: () => fetchAutoLabelUri(p, w),
    enabled: enabled && (!!p || !!w),
    // A found label is kept for a day; a miss only for 15 minutes, so a
    // passing failure is retried later without re-running the search on
    // every open.
    staleTime: (q) => (q.state.data ? 1000 * 60 * 60 * 24 : 1000 * 60 * 15),
    gcTime: 1000 * 60 * 60 * 24,
  });
  return data ?? null;
}
