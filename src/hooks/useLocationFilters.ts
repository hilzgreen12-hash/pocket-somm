import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import {
  fetchLocationFilters,
  createLocationFilter,
  setCustomFilterWines,
  renameCustomFilter,
  deleteCustomFilter,
  type CustomFilter,
} from '../api/customFilters';

// Bespoke filters for a single Other Home Storage location — the same
// custom_filters table as racks, scoped by storage_location_id (migration 075).
// Mirrors useCustomFilters so the screen wiring reads identically.
export function useLocationFilters(locationId: string | undefined) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const qc = useQueryClient();
  const key = ['location-filters', userId, locationId];

  const { data: customFilters = [], isLoading } = useQuery<CustomFilter[]>({
    queryKey: key,
    queryFn: () => fetchLocationFilters(userId!, locationId!),
    enabled: !!userId && !!locationId,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const create = useMutation({
    mutationFn: ({ name, wineIds }: { name: string; wineIds: string[] }) =>
      createLocationFilter(userId!, name, wineIds, locationId!),
    onSuccess: invalidate,
  });

  const setWines = useMutation({
    mutationFn: ({ filterId, wineIds }: { filterId: string; wineIds: string[] }) =>
      setCustomFilterWines(filterId, wineIds),
    onSuccess: invalidate,
  });

  const rename = useMutation({
    mutationFn: ({ filterId, name }: { filterId: string; name: string }) =>
      renameCustomFilter(filterId, name),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (filterId: string) => deleteCustomFilter(filterId),
    onSuccess: invalidate,
  });

  return { customFilters, isLoading, create, setWines, rename, remove };
}
