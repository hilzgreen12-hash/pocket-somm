import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { fetchLabels, createLabel, deleteLabel, setLabelFavourite, type CreateLabelInput } from '../api/labels';

// Your Label Library — the `labels` table (migration 066).
export function useLabels() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const userId = session?.user.id;

  const { data: labels = [], isLoading } = useQuery({
    queryKey: ['labels', userId],
    queryFn: () => fetchLabels(userId!),
    enabled: !!userId,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['labels', userId] });

  const create = useMutation({
    mutationFn: (input: CreateLabelInput) => createLabel(userId!, input),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteLabel(id),
    onSuccess: invalidate,
  });

  const setFavourite = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) => setLabelFavourite(id, value),
    onSuccess: invalidate,
  });

  return { labels, isLoading, create, remove, setFavourite };
}
