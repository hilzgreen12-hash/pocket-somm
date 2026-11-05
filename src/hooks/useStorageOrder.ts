import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { cellarOwner } from '../api/cellarContext';

// The user's own order for their home-storage tiles (Cellar tab "Your Wines At
// Home" carousel), saved on this device per cellar. Keys look like
// "rack:<id>", "bin:<id>", "loc:<id>". The rack / bin / alt-cellar screens'
// ‹ › arrows follow the same order.

export const storageKey = (kind: 'rack' | 'bin' | 'location', id: string) =>
  `${kind === 'location' ? 'loc' : kind}:${id}`;

export function useStorageOrder() {
  const { session } = useAuth();
  const owner = cellarOwner(session?.user.id) ?? null;
  const qc = useQueryClient();
  const queryKey = ['storage-order', owner];
  const { data: saved = [] } = useQuery({
    queryKey,
    enabled: !!owner,
    staleTime: Infinity,
    queryFn: async () => {
      try {
        const raw = await AsyncStorage.getItem(`home_storage_order_${owner}`);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? (parsed as string[]) : [];
      } catch { return []; }
    },
  });

  const save = useCallback((next: string[]) => {
    qc.setQueryData(['storage-order', owner], next);
    AsyncStorage.setItem(`home_storage_order_${owner}`, JSON.stringify(next)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner, qc]);

  // Sort items by the saved order; anything new keeps its default position
  // relative to the others (appended after the saved ones, in default order).
  const sort = useCallback(<T,>(items: T[], keyOf: (t: T) => string): T[] => {
    if (saved.length === 0) return items;
    const rank = new Map(saved.map((k, i) => [k, i]));
    return items
      .map((t, i) => ({ t, i, r: rank.get(keyOf(t)) }))
      .sort((a, b) => {
        if (a.r != null && b.r != null) return a.r - b.r;
        if (a.r != null) return -1;
        if (b.r != null) return 1;
        return a.i - b.i;
      })
      .map((x) => x.t);
  }, [saved]);

  return { saved, save, sort };
}
