import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useCellar, useArchive } from './useCellar';
import { saveChosenWine, saveManualChosenWine, fetchChosenWines, updateChosenWine, deleteChosenWine, patchChosenWine, type SaveChosenWineInput, type ManualSaveChosenWineInput, type UpdateChosenWineInput } from '../api/chosenWines';
import type { ChosenWine, CellarWine } from '../types/wine';
import { fetchAutoLabelUri } from '../api/label';
import { uploadLabelImage } from '../api/labelPhotos';
import { sameWineIdentity } from '../utils/wineMatch';
import { buildReviewCards, awaitingPicks } from '../utils/reviewModel';
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
        ].find((w) => w.user_id === userId && w.label_image_path && sameWineIdentity(
          { producer: w.producer, wine_name: w.wine_name, vintage: null },
          { producer: row.producer, wine_name: row.wine_name, vintage: null },
        ));
        let path = owned?.label_image_path ?? null;
        if (!path) {
          const uri = await fetchAutoLabelUri(row.producer ?? '', row.wine_name);
          if (!uri) return;
          path = await uploadLabelImage(userId, uri, `review-${row.id}`);
        }
        // Fill the photo only while it's still empty, in ONE conditional write:
        // the user's own photo may land while this lookup runs, and a separate
        // check-then-write could slip in between and overwrite it.
        const { data: filled } = await supabase.from('chosen_wines')
          .update({ label_image_path: path })
          .eq('id', row.id)
          .is('label_image_path', null)
          .select('id');
        if (filled?.length) qc.invalidateQueries({ queryKey: ['chosen-wines', userId] });
      } catch { /* best-effort: the review stands without a photo */ }
    })();
  }

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['chosen-wines', userId] });
    qc.invalidateQueries({ queryKey: ['my-community-uploads', userId] });
  };

  // Community sharing is opt-in only — it happens when the user taps "Share to
  // Community" on a review, never automatically on save or edit.
  const save = useMutation({
    mutationFn: async (input: SaveChosenWineInput) => {
      const saved = await saveChosenWine(userId!, input);
      attachLabelPhoto(saved);
      return saved; // the created row, so callers can track this session's pick
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateChosenWineInput }) => updateChosenWine(id, input),
    onSuccess: invalidate,
  });

  // ownPhoto: the caller is about to upload the user's own label photo, so no
  // background stand-in image is looked up for this review.
  const saveManual = useMutation({
    mutationFn: async ({ ownPhoto, ...input }: ManualSaveChosenWineInput & { ownPhoto?: boolean }) => {
      const row = await saveManualChosenWine(userId!, input);
      if (!ownPhoto) attachLabelPhoto(row);
      return row;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteChosenWine(id),
    onSuccess: invalidate,
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

// Your Wine Reviews as cards (one per wine) plus the picks awaiting a review,
// built from the user's chosen wines and their OWN cellar bottles, live and
// archived. While a shared household cellar is selected the cellar queries hold
// the owner's bottles; their reviews are the owner's, so they're left out.
export function useWineReviewCards() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { chosenWines, isLoading } = useChosenWines();
  const { wines: live } = useCellar();
  const { wines: archived } = useArchive();
  const ownBottles = useMemo(
    () => [...live, ...archived].filter((w) => w.user_id === userId),
    [live, archived, userId],
  );
  const cards = useMemo(() => buildReviewCards(chosenWines, ownBottles), [chosenWines, ownBottles]);
  const awaiting = useMemo(() => awaitingPicks(chosenWines, cards), [chosenWines, cards]);
  return { cards, awaiting, isLoading };
}
