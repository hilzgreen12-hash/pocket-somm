import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { saveChosenWine, fetchChosenWines, type SaveChosenWineInput } from '../api/chosenWines';

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

  return { chosenWines, isLoading, save };
}
