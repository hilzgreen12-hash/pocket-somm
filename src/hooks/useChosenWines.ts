import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { saveChosenWine, fetchChosenWines, updateChosenWine, type SaveChosenWineInput, type UpdateChosenWineInput } from '../api/chosenWines';
import { syncReviewToCellar } from '../services/reviewSync';

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
    mutationFn: async (input: SaveChosenWineInput) => {
      await saveChosenWine(userId!, input);
      await syncReviewToCellar(
        userId!,
        { producer: input.wine.producer, wineName: input.wine.name, vintage: input.wine.vintage },
        { tastingNote: input.tastingNote, restaurantName: input.restaurantName, city: input.city, userScore: input.userScore },
        { setReviewDate: true },
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chosen-wines', userId] });
      qc.invalidateQueries({ queryKey: ['wishlist', userId] });
      qc.invalidateQueries({ queryKey: ['cellar', userId] });
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateChosenWineInput }) => {
      await updateChosenWine(id, input);
      await syncReviewToCellar(
        userId!,
        { producer: input.producer, wineName: input.wineName, vintage: input.vintage },
        { tastingNote: input.tastingNote, restaurantName: input.restaurantName, city: input.city, userScore: input.userScore },
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chosen-wines', userId] });
      qc.invalidateQueries({ queryKey: ['wishlist', userId] });
      qc.invalidateQueries({ queryKey: ['cellar', userId] });
    },
  });

  return { chosenWines, isLoading, save, update };
}
