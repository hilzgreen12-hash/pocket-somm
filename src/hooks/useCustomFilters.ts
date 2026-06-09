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

export function useCustomFilters() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const qc = useQueryClient();
  const key = ['custom-filters', userId];

  const { data: customFilters = [], isLoading } = useQuery<CustomFilter[]>({
    queryKey: key,
    queryFn: () => fetchCustomFilters(userId!),
    enabled: !!userId,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const create = useMutation({
    mutationFn: ({ name, wineIds }: { name: string; wineIds: string[] }) =>
      createCustomFilter(userId!, name, wineIds),
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
