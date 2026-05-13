import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { saveChosenWine, fetchChosenWines, updateChosenWine, type SaveChosenWineInput, type UpdateChosenWineInput } from '../api/chosenWines';
import { findMatchingWishlistWine, updateCellarWine } from '../api/cellar';

// Push the user-supplied review fields onto a matching wishlist entry,
// if one exists, so the wishlist card reflects whatever the user wrote
// in the review. Last-edit-wins by design: editing the review later
// overwrites the wishlist note/score/location with the latest values.
async function syncReviewToWishlist(
  userId: string,
  identity: { producer: string | null; wineName: string; vintage: number | null },
  fields: { tastingNote: string; restaurantName: string; city: string; userScore: number | null; setReviewDate: boolean }
): Promise<void> {
  const match = await findMatchingWishlistWine(userId, identity);
  if (!match) return;
  const location = [fields.restaurantName.trim(), fields.city.trim()].filter(Boolean).join(', ');
  const updates: Record<string, unknown> = {
    tasting_notes: fields.tastingNote.trim() || null,
    user_notes: location || null,
    review_score: fields.userScore,
    review_location: location || null,
  };
  if (fields.setReviewDate) {
    updates.review_date = new Date().toISOString().split('T')[0];
  }
  await updateCellarWine(match.id, updates as any);
}

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
      await syncReviewToWishlist(
        userId!,
        { producer: input.wine.producer, wineName: input.wine.name, vintage: input.wine.vintage },
        { tastingNote: input.tastingNote, restaurantName: input.restaurantName, city: input.city, userScore: input.userScore, setReviewDate: true },
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chosen-wines', userId] });
      qc.invalidateQueries({ queryKey: ['wishlist', userId] });
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateChosenWineInput }) => {
      await updateChosenWine(id, input);
      await syncReviewToWishlist(
        userId!,
        { producer: input.producer, wineName: input.wineName, vintage: input.vintage },
        { tastingNote: input.tastingNote, restaurantName: input.restaurantName, city: input.city, userScore: input.userScore, setReviewDate: false },
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chosen-wines', userId] });
      qc.invalidateQueries({ queryKey: ['wishlist', userId] });
    },
  });

  return { chosenWines, isLoading, save, update };
}
