import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { saveChosenWine, saveManualChosenWine, fetchChosenWines, updateChosenWine, type SaveChosenWineInput, type ManualSaveChosenWineInput, type UpdateChosenWineInput } from '../api/chosenWines';
import { syncReviewToCellar } from '../services/reviewSync';
import { publishChosenWineToCommunity } from '../services/communityPublish';
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
      const row = await saveChosenWine(userId!, input);
      await syncReviewToCellar(
        userId!,
        { producer: input.wine.producer, wineName: input.wine.name, vintage: input.wine.vintage },
        { tastingNote: input.tastingNote, restaurantName: input.restaurantName, city: input.city, userScore: input.userScore },
        { setReviewDate: true },
      );
      try { await publishChosenWineToCommunity(row); } catch (err) { console.warn('[community] publishChosenWineToCommunity failed (non-fatal):', err); }
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
      const existing = (qc.getQueryData<ChosenWine[]>(['chosen-wines', userId]) ?? []).find((w) => w.id === id);
      if (existing) {
        const merged: ChosenWine = {
          ...existing,
          restaurant_name: input.restaurantName || null,
          city: input.city || null,
          tasting_note: input.tastingNote || null,
          other_observations: input.otherObservations || null,
          user_score: input.userScore,
        };
        try { await publishChosenWineToCommunity(merged); } catch (err) { console.warn('[community] publishChosenWineToCommunity (update) failed (non-fatal):', err); }
      }
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
      const row = await saveManualChosenWine(userId!, input);
      // Sync to a matching cellar/wishlist row when one exists, same as
      // the scan-driven save path.
      await syncReviewToCellar(
        userId!,
        { producer: input.producer, wineName: input.wineName, vintage: input.vintage },
        { tastingNote: input.tastingNote, restaurantName: input.restaurantName, city: input.city, userScore: input.userScore },
        { setReviewDate: true },
      );
      try { await publishChosenWineToCommunity(row); } catch (err) { console.warn('[community] publishChosenWineToCommunity (manual) failed (non-fatal):', err); }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chosen-wines', userId] });
      qc.invalidateQueries({ queryKey: ['wishlist', userId] });
      qc.invalidateQueries({ queryKey: ['cellar', userId] });
      qc.invalidateQueries({ queryKey: ['my-community-uploads', userId] });
    },
  });

  return { chosenWines, isLoading, save, update, saveManual };
}
