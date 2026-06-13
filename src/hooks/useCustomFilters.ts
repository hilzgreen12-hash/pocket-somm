import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import {
  fetchCustomFilters,
  createCustomFilter,
  setCustomFilterWines,
  renameCustomFilter,
  deleteCustomFilter,
  type CustomFilter,
} from '../api/customFilters';

// Custom filters are scoped to a single rack (migration 051) — pass the rack
// whose filters you want. The query key includes the rackId so each rack keeps
// its own cached list.
export function useCustomFilters(rackId: string | undefined) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const qc = useQueryClient();
  const key = ['custom-filters', userId, rackId];

  const { data: customFilters = [], isLoading } = useQuery<CustomFilter[]>({
    queryKey: key,
    queryFn: () => fetchCustomFilters(userId!, rackId!),
    enabled: !!userId && !!rackId,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const create = useMutation({
    mutationFn: ({ name, wineIds }: { name: string; wineIds: string[] }) =>
      createCustomFilter(userId!, name, wineIds, rackId!),
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
