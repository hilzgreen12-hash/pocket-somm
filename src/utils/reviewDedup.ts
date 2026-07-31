import type { ChosenWine } from '../types/wine';

// Shared helpers for the duplicate-review flow. When a user reviews a
// wine they've already reviewed (matched by identity), the review modals
// offer to Update / Add to / Create new — these back that.

function norm(s: string | null | undefined): string {
  return (s ?? '').trim().toLowerCase();
}

export interface WineIdentity {
  producer: string | null | undefined;
  wineName: string | null | undefined;
  vintage: string | number | null | undefined;
}

// Find an existing review for the same wine identity (producer + name +
// vintage, normalised — same criterion as reviewSync). Returns the most
// recent match, or null.
export function findExistingReview(reviews: ChosenWine[], identity: WineIdentity): ChosenWine | null {
  const p = norm(identity.producer);
  const n = norm(identity.wineName);
  const v = norm(identity.vintage != null ? String(identity.vintage) : '');
  const matches = reviews.filter((r) =>
    norm(r.producer) === p &&
    norm(r.wine_name) === n &&
    norm(r.vintage != null ? String(r.vintage) : '') === v,
  );
  if (matches.length === 0) return null;
  return matches.reduce((a, b) =>
    new Date(b.chosen_at).getTime() > new Date(a.chosen_at).getTime() ? b : a,
  );
}

// Append a dated tasting entry to an existing free-text note, so an
// "Add to review" turns a review into a small dated log rather than
// overwriting it.
export function appendDatedEntry(
  existing: string | null | undefined,
  addition: string,
  dateLabel: string,
): string {
  const add = (addition ?? '').trim();
  const base = (existing ?? '').trim();
  if (!add) return base;
  const header = `— ${dateLabel} —`;
  return base ? `${base}\n\n${header}\n${add}` : `${header}\n${add}`;
}

export function todayLabel(): string {
  return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ---- Append-only, 24-hour-locked reviews (migration 079) ----

// A saved review is editable for 24 hours, then locks as a read-only reflection.
export const REVIEW_EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

// Whether a review entry is still within its editable window. reviewed_at is
// server-stamped when review content first appears and never changes; a null
// means the entry has no review yet (a bare pick), which stays editable so the
// first review can be written.
export function isReviewEditable(reviewedAt: string | null | undefined): boolean {
  if (!reviewedAt) return true;
  const t = new Date(reviewedAt).getTime();
  if (!Number.isFinite(t)) return true;
  return Date.now() - t < REVIEW_EDIT_WINDOW_MS;
}

// Whole-number hours left in the edit window (0 once locked) — for copy like
// "you can edit this for N more hours".
export function editHoursRemaining(reviewedAt: string | null | undefined): number {
  if (!reviewedAt) return 24;
  const left = REVIEW_EDIT_WINDOW_MS - (Date.now() - new Date(reviewedAt).getTime());
  return Math.max(0, Math.ceil(left / (60 * 60 * 1000)));
}

// Grouping key for a review entry: its review_group_id, or its own id for
// legacy/ungrouped rows. Entries sharing a key are one review card.
export function reviewGroupKey(r: ChosenWine): string {
  return r.review_group_id ?? r.id;
}

// Pure "what's empty" check for the pre-save prompt. Pass the review's fields
// (the caller omits the optional personal note); returns the labels of the
// empty ones, [] when nothing is missing.
export function missingReviewFields(fields: { label: string; filled: boolean }[]): string[] {
  return fields.filter((f) => !f.filled).map((f) => f.label);
}
