import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useRacks } from './useRacks';
import { getBins } from '../api/bins';
import { fetchStorageLocations } from '../api/storageLocations';

// One continuous navigation sequence across every home-storage location, in the
// SAME order the "Your Wines at Home" carousel (HomeStorageSection) renders:
// all racks (fridges included) first, then bins, then Alt Cellars. Powers the
// header ‹ › arrows + swipe on the rack / bin / storage-location screens so they
// hop through the whole set rather than dead-ending within one type.

export type StorageNavKind = 'rack' | 'bin' | 'location';

export interface StorageNavEntry {
  id: string;
  kind: StorageNavKind;
  name: string;
  route: string;
}

function routeFor(kind: StorageNavKind, id: string): string {
  if (kind === 'bin') return `/cellar/bin/${id}`;
  if (kind === 'location') return `/cellar/storage-location/${id}`;
  return `/cellar/rack/${id}`;
}

export interface StorageLocationNav {
  locations: StorageNavEntry[];
  indexOf: (id: string) => number;
  prev: (id: string) => StorageNavEntry | null;
  next: (id: string) => StorageNavEntry | null;
}

export function useStorageLocationNav(): StorageLocationNav {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { racks } = useRacks();

  // Reuse the SAME query keys as HomeStorageSection so the cache is shared and
  // these reads are free once the carousel has loaded them.
  const { data: bins = [] } = useQuery({
    queryKey: ['bins', userId],
    queryFn: () => getBins(userId!),
    enabled: !!userId,
  });
  const { data: storageLocations = [] } = useQuery({
    queryKey: ['storage-locations', userId],
    queryFn: () => fetchStorageLocations(userId!),
    enabled: !!userId,
  });

  const locations = useMemo<StorageNavEntry[]>(() => {
    const rackEntries: StorageNavEntry[] = racks.map((r) => ({
      id: r.id,
      kind: 'rack',
      name: r.name,
      route: routeFor('rack', r.id),
    }));
    const binEntries: StorageNavEntry[] = bins.map((b) => ({
      id: b.id,
      kind: 'bin',
      name: b.name,
      route: routeFor('bin', b.id),
    }));
    const locationEntries: StorageNavEntry[] = storageLocations.map((l) => ({
      id: l.id,
      kind: 'location',
      name: l.name,
      route: routeFor('location', l.id),
    }));
    return [...rackEntries, ...binEntries, ...locationEntries];
  }, [racks, bins, storageLocations]);

  return useMemo<StorageLocationNav>(() => {
    const indexOf = (id: string) => locations.findIndex((l) => l.id === id);
    const prev = (id: string) => {
      const i = indexOf(id);
      return i > 0 ? locations[i - 1] : null;
    };
    const next = (id: string) => {
      const i = indexOf(id);
      return i >= 0 && i < locations.length - 1 ? locations[i + 1] : null;
    };
    return { locations, indexOf, prev, next };
  }, [locations]);
}
