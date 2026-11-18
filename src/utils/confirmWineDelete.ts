import { showAlert } from '../components/AppAlert';
import { entriesOf } from './cellarReview';
import type { CellarWine } from '../types/wine';

// How many reviews are stored on these cellar rows. A wine's reviews live on its
// cellar_wines row, so deleting the row deletes them too.
export function reviewsOn(rows: (Pick<CellarWine, 'review_entries'> | null | undefined)[]): number {
  return rows.reduce((n, w) => n + entriesOf(w).length, 0);
}

// The one "Delete this wine?" confirmation for every cellar screen. When the
// delete removes rows that carry reviews, it says those reviews go too and — if
// `onArchive` is given (a wine still in the cellar) — offers to archive it
// instead, which keeps them.
export function confirmWineDelete(opts: {
  // What is deleted, e.g. "Permanently remove it from your cellar."
  lead?: string;
  title?: string;
  // Reviews on the rows this delete removes entirely (0 for a partial delete).
  reviewsLost: number;
  deleteText?: string;
  onDelete: () => void;
  onArchive?: () => void;
}): void {
  const { lead = 'Permanently remove it from your cellar.', reviewsLost, onArchive } = opts;
  const reviewLine = reviewsLost === 0 ? ''
    : reviewsLost === 1 ? ' Your review of this wine will be deleted too.'
    : ` Your ${reviewsLost} reviews of this wine will be deleted too.`;
  showAlert({
    title: opts.title ?? 'Delete this wine?',
    body: `${lead}${reviewLine} This can't be undone.`,
    buttons: [
      ...(reviewsLost > 0 && onArchive ? [{ text: 'Archive instead (keeps your reviews)', onPress: onArchive }] : []),
      { text: opts.deleteText ?? 'Delete (permanent)', style: 'destructive' as const, onPress: opts.onDelete },
      { text: 'Cancel', style: 'cancel' as const },
    ],
  });
}
