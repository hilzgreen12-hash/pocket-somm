import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { saveChosenWine, saveManualChosenWine, fetchChosenWines, updateChosenWine, deleteChosenWine, type SaveChosenWineInput, type ManualSaveChosenWineInput, type UpdateChosenWineInput } from '../api/chosenWines';
import { syncReviewToCellar } from '../services/reviewSync';
import type { ChosenWine } from '../types/wine';

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
      // Community sharing is opt-in only — it happens when the user taps
      // "Share to Community" on a review, never automatically on save.
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chosen-wines', userId] });
      qc.invalidateQueries({ queryKey: ['wishlist', userId] });
      qc.invalidateQueries({ queryKey: ['cellar', userId] });
      qc.invalidateQueries({ queryKey: ['my-community-uploads', userId] });
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
      // Community sharing stays opt-in (see save above) — editing a review
      // no longer republishes it automatically.
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chosen-wines', userId] });
      qc.invalidateQueries({ queryKey: ['wishlist', userId] });
      qc.invalidateQueries({ queryKey: ['cellar', userId] });
      qc.invalidateQueries({ queryKey: ['my-community-uploads', userId] });
    },
  });

  const saveManual = useMutation({
    mutationFn: async (input: ManualSaveChosenWineInput) => {
      await saveManualChosenWine(userId!, input);
      // Sync to a matching cellar/wishlist row when one exists, same as
      // the scan-driven save path.
      await syncReviewToCellar(
        userId!,
        { producer: input.producer, wineName: input.wineName, vintage: input.vintage },
        { tastingNote: input.tastingNote, restaurantName: input.restaurantName, city: input.city, userScore: input.userScore },
        { setReviewDate: true },
      );
      // Community sharing stays opt-in (see save above).
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chosen-wines', userId] });
      qc.invalidateQueries({ queryKey: ['wishlist', userId] });
      qc.invalidateQueries({ queryKey: ['cellar', userId] });
      qc.invalidateQueries({ queryKey: ['my-community-uploads', userId] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteChosenWine(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chosen-wines', userId] });
      qc.invalidateQueries({ queryKey: ['my-community-uploads', userId] });
    },
  });

  return { chosenWines, isLoading, save, update, saveManual, remove };
}
