import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import {
  fetchLibraryFilters,
  createLibraryFilter,
  setLibraryFilterItems,
  renameLibraryFilter,
  deleteLibraryFilter,
  type LibraryFilter,
  type LibraryScope,
} from '../api/libraryFilters';

// User-created filters for a library (Label or Lineup). Mirrors useCustomFilters
// but generic over scope.
export function useLibraryFilters(scope: LibraryScope) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const qc = useQueryClient();
  const key = ['library-filters', userId, scope];

  const { data: filters = [], isLoading } = useQuery<LibraryFilter[]>({
    queryKey: key,
    queryFn: () => fetchLibraryFilters(userId!, scope),
    enabled: !!userId,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const create = useMutation({
    mutationFn: ({ name, itemIds }: { name: string; itemIds: string[] }) =>
      createLibraryFilter(userId!, scope, name, itemIds),
    onSuccess: invalidate,
  });
  const setItems = useMutation({
    mutationFn: ({ filterId, itemIds }: { filterId: string; itemIds: string[] }) =>
      setLibraryFilterItems(filterId, itemIds),
    onSuccess: invalidate,
  });
  const rename = useMutation({
    mutationFn: ({ filterId, name }: { filterId: string; name: string }) =>
      renameLibraryFilter(filterId, name),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (filterId: string) => deleteLibraryFilter(filterId),
    onSuccess: invalidate,
  });

  return { filters, isLoading, create, setItems, rename, remove };
}
