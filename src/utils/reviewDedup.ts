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
