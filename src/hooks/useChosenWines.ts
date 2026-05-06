import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { saveChosenWine, fetchChosenWines, updateChosenWine, type SaveChosenWineInput, type UpdateChosenWineInput } from '../api/chosenWines';

export function useChosenWines() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const userId = session?.user.id;

  const { data: chosenWines = [], isLoading } = useQuery({
    queryKey: ['chosen-wines', userId],
    queryFn: () => fetchChosenWines(userId!),
    enabled: !!userId,
  });

  const save = useMutation({
    mutationFn: (input: SaveChosenWineInput) => saveChosenWine(userId!, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chosen-wines', userId] }),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateChosenWineInput }) => updateChosenWine(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chosen-wines', userId] }),
  });

  return { chosenWines, isLoading, save, update };
}
