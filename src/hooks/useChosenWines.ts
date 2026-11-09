import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { saveChosenWine, saveManualChosenWine, fetchChosenWines, updateChosenWine, deleteChosenWine, patchChosenWine, type SaveChosenWineInput, type ManualSaveChosenWineInput, type UpdateChosenWineInput } from '../api/chosenWines';
import { syncReviewToCellar } from '../services/reviewSync';
import type { ChosenWine, CellarWine } from '../types/wine';
import { fetchAutoLabelUri } from '../api/label';
import { uploadLabelImage } from '../api/labelPhotos';
import { sameWineIdentity } from '../utils/wineMatch';
import { supabase } from '../api/supabase';

export function useChosenWines() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const userId = session?.user.id;

  const { data: chosenWines = [], isLoading } = useQuery({
    queryKey: ['chosen-wines', userId],
    queryFn: () => fetchChosenWines(userId!),
    enabled: !!userId,
  });

  // A review saved without a label photo gets one in the background: the user's
  // own photo of that wine from the cellar/archive when there is one, else the
  // wine's label found online (same lookup cellar adds use). Never blocks the save.
  function attachLabelPhoto(row: ChosenWine | null | undefined) {
    if (!row?.id || row.label_image_path || !userId) return;
    void (async () => {
      try {
        const owned = [
          ...(qc.getQueryData<CellarWine[]>(['cellar', userId]) ?? []),
          ...(qc.getQueryData<CellarWine[]>(['cellar-archive', userId]) ?? []),
        ].find((w) => w.label_image_path && sameWineIdentity(
          { producer: w.producer, wine_name: w.wine_name, vintage: null },
          { producer: row.producer, wine_name: row.wine_name, vintage: null },
        ));
        let path = owned?.label_image_path ?? null;
        if (!path) {
          const uri = await fetchAutoLabelUri(row.producer ?? '', row.wine_name);
          if (!uri) return;
          path = await uploadLabelImage(userId, uri, `review-${row.id}`);
        }
        // Only fill a still-empty photo: the caller may have attached the
        // user's own photo while this lookup ran — never overwrite it.
        const { data: cur } = await supabase.from('chosen_wines').select('label_image_path').eq('id', row.id).maybeSingle();
        if (cur?.label_image_path) return;
        await patchChosenWine(row.id, { label_image_path: path });
        qc.invalidateQueries({ queryKey: ['chosen-wines', userId] });
      } catch { /* best-effort: the review stands without a photo */ }
    })();
  }

  const save = useMutation({
    mutationFn: async (input: SaveChosenWineInput) => {
      const saved = await saveChosenWine(userId!, input);
      await syncReviewToCellar(
        userId!,
        { producer: input.wine.producer, wineName: input.wine.name, vintage: input.wine.vintage },
        { tastingNote: input.tastingNote, restaurantName: input.restaurantName, city: input.city, userScore: input.userScore },
        { setReviewDate: true },
      );
      // Community sharing is opt-in only — it happens when the user taps
      // "Share to Community" on a review, never automatically on save.
      attachLabelPhoto(saved);
      return saved; // the created row, so callers can track this session's pick
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
      const row = await saveManualChosenWine(userId!, input);
      // Sync to a matching cellar/wishlist row when one exists, same as
      // the scan-driven save path.
      await syncReviewToCellar(
        userId!,
        { producer: input.producer, wineName: input.wineName, vintage: input.vintage },
        { tastingNote: input.tastingNote, restaurantName: input.restaurantName, city: input.city, userScore: input.userScore },
        { setReviewDate: true },
      );
      // Community sharing stays opt-in (see save above).
      attachLabelPhoto(row);
      return row;
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

  // Hide a restaurant bottle-pick from the "Awaiting Review" list on Your Wine
  // Reviews without deleting it — the row stays on the restaurant card in Your
  // Restaurants. A soft flag, not a delete (see migration 087).
  const dismissAwaiting = useMutation({
    mutationFn: (id: string) => patchChosenWine(id, { review_dismissed: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chosen-wines', userId] });
    },
  });

  // Lightweight favourite toggle from the review thumbnail — a single-column
  // patch, so it never touches the review body or its timestamps.
  const setFavourite = useMutation({
    mutationFn: ({ id, isFavourite }: { id: string; isFavourite: boolean }) =>
      patchChosenWine(id, { is_favourite: isFavourite }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chosen-wines', userId] });
    },
  });

  return { chosenWines, isLoading, save, update, saveManual, remove, dismissAwaiting, setFavourite };
}
