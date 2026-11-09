import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCellar } from './useCellar';
import { useAuth } from './useAuth';
import { fetchStorageLocations } from '../api/storageLocations';
import { fetchPlacementsForWines } from '../api/placements';
import { homeOnlyWines } from '../utils/homeWines';

// Cellar wines with at least one bottle at home (not only in an external
// cellar). Vinster only recommends from these: pairings, Serve before/after.
// `ready` is false while the external-cellar check is still loading, so callers
// can avoid briefly recommending an external bottle.
export function useHomeCellarWines() {
  const { wines } = useCellar();
  const { session } = useAuth();
  const userId = session?.user.id;
  const { data: locations, isLoading: locLoading } = useQuery({
    queryKey: ['cellar-locations-ext', userId],
    queryFn: () => fetchStorageLocations(userId!),
    enabled: !!userId,
  });
  const externalIds = useMemo(
    () => new Set((locations ?? []).filter((l) => l.is_external).map((l) => l.id)),
    [locations],
  );
  const wineIds = wines.map((w) => w.id);
  const needPlacements = !!userId && wineIds.length > 0 && externalIds.size > 0;
  const { data: placements = [], isLoading: plLoading } = useQuery({
    queryKey: ['home-insights-placements', userId, wineIds.length],
    queryFn: () => fetchPlacementsForWines(wineIds),
    enabled: needPlacements,
  });
  const homeWines = useMemo(() => homeOnlyWines(wines, placements, externalIds), [wines, placements, externalIds]);
  const ready = !userId || (!locLoading && !(needPlacements && plLoading));
  return { wines: homeWines, allWines: wines, ready };
}
