import type { QueryClient } from '@tanstack/react-query';
import { showAlert } from '../AppAlert';
import { invalidateCellarViews } from '../../hooks/useCellar';
import { deleteLocationAndWines, deleteLocationKeepWines } from '../../api/placements';
import { summariseLocationContents } from '../../services/storageContents';

const count = (n: number, noun: string) => `${n} ${noun}${n === 1 ? '' : 's'}`;

// Deleting an alt cellar: say what's in it first, then keep its wines (they
// stay in the cellar, unplaced) or delete them with it. A wine with bottles
// elsewhere only loses the ones here; one kept only here goes, with its
// reviews, so those are counted. A big external import takes a while to
// delete, so `onProgress` reports as it goes (null when finished).
export async function confirmDeleteAltCellar(loc: { id: string; name: string }, opts: {
  qc: QueryClient;
  onDeleted?: () => void;
  onProgress?: (progress: { done: number; total: number } | null) => void;
}): Promise<void> {
  const onError = (err: unknown) => showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' });
  let contents: Awaited<ReturnType<typeof summariseLocationContents>>;
  try {
    contents = await summariseLocationContents(loc.id);
  } catch (err) {
    onError(err);
    return;
  }
  const run = async (withWines: boolean) => {
    try {
      if (withWines) {
        await deleteLocationAndWines(loc.id, (done, total) => opts.onProgress?.({ done, total }), contents.list);
      } else {
        await deleteLocationKeepWines(loc.id);
      }
      opts.onDeleted?.();
    } catch (err) {
      onError(err);
    } finally {
      opts.onProgress?.(null);
      invalidateCellarViews(opts.qc);
    }
  };

  const { bottles, wines, reviewsLost } = contents;
  if (bottles === 0) {
    showAlert({
      title: `Delete ${loc.name}?`,
      body: "It's empty, so no wines are affected.",
      buttons: [
        { text: 'Delete Alt Cellar', style: 'destructive', onPress: () => void run(false) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
    return;
  }
  const reviews = reviewsLost === 0 ? '' : ` — and your ${reviewsLost === 1 ? 'review' : `${reviewsLost} reviews`} of them`;
  showAlert({
    title: `Delete ${loc.name}?`,
    body: `${count(bottles, 'bottle')} (${count(wines, 'wine')}) ${bottles === 1 ? 'is' : 'are'} stored here. Keep them in your cellar as unplaced bottles, or delete them permanently${reviews}. Bottles of these wines stored elsewhere stay either way. Deleting can't be undone.`,
    buttons: [
      { text: 'Delete & Keep Wines', onPress: () => void run(false) },
      { text: 'Delete Alt Cellar & Wines', style: 'destructive', onPress: () => void run(true) },
      { text: 'Cancel', style: 'cancel' },
    ],
  });
}
