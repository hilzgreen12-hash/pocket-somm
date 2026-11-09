import type { QueryClient } from '@tanstack/react-query';
import { listChefArchiveCollections } from './chefArchiveCollections';
import { listChefLabelSessions } from './chef';
import { getFavouritesCover } from './cookbookFavouritesCover';
import { getCachedLabelUri } from './labelImageCache';

// Warm the Pair tab's cookbook carousel in the background after sign-in, so the
// folders, counts and cover images are already there when the tab opens
// (otherwise it waits on a chain of network calls that only starts on open).
// Keys match the hooks that read them; covers land in the on-disk image cache.
const LONG = 24 * 60 * 60 * 1000;

export async function prefetchCookbook(qc: QueryClient, userId: string): Promise<void> {
  try {
    const [collections, favCover] = await Promise.all([
      qc.fetchQuery({ queryKey: ['chef-archive-collections', userId], queryFn: () => listChefArchiveCollections(userId), gcTime: LONG }),
      qc.fetchQuery({ queryKey: ['cookbook-favourites-cover', userId], queryFn: () => getFavouritesCover(userId), gcTime: LONG }),
      qc.prefetchQuery({ queryKey: ['chef-label-sessions', userId], queryFn: () => listChefLabelSessions(userId), gcTime: LONG }),
    ]);
    const paths = [favCover, ...collections.map((c) => c.image_path)]
      .filter((p): p is string => !!p && !/^https?:\/\//i.test(p));
    await Promise.all(paths.map((path) =>
      qc.prefetchQuery({ queryKey: ['label-image', path], queryFn: () => getCachedLabelUri(path), staleTime: 60 * 1000, gcTime: LONG })));
  } catch { /* best-effort: the carousel still loads itself on open */ }
}
