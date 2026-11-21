import { useEffect, useState, type ReactNode } from 'react';
import { IsRestoringProvider, QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { restorePersistedQueries, subscribePersistedQueries } from '../api/queryPersistence';

// QueryClientProvider that first restores the last session's lists from disk
// (see queryPersistence), then keeps them saved. While restoring, queries wait
// (IsRestoringProvider) rather than fetch, so restored data is shown first and
// refreshed after. Same contract as PersistQueryClientProvider, but with saves
// batched before the cache is snapshotted.
export function PersistedQueryProvider({ client, children }: { client: QueryClient; children: ReactNode }) {
  const [restoring, setRestoring] = useState(true);
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    void restorePersistedQueries(client).finally(() => {
      if (cancelled) return;
      setRestoring(false);
      unsubscribe = subscribePersistedQueries(client);
    });
    return () => { cancelled = true; unsubscribe?.(); };
  }, [client]);
  return (
    <QueryClientProvider client={client}>
      <IsRestoringProvider value={restoring}>{children}</IsRestoringProvider>
    </QueryClientProvider>
  );
}
