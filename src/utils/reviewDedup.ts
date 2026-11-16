import type { ChosenWine } from '../types/wine';
import { wineNameKey, looseWineMatch } from './wineIdentity';

// Shared helpers for the duplicate-review flow. When a user reviews a
// wine they've already reviewed (matched by identity), the review modals
// offer to Update / Add to / Create new — these back that.

function norm(s: string | null | undefined): string {
  return (s ?? '').trim().toLowerCase();
}

interface WineIdentity {
  producer: string | null | undefined;
  wineName: string | null | undefined;
  vintage: string | number | null | undefined;
  // Wine-Searcher id, when known — the authoritative match anchor.
  wsWineId?: string | null;
}

// Find an existing review for the same wine identity (producer + name +
// vintage, normalised — same criterion as reviewSync). Returns the most
// recent match, or null.
export function findExistingReview(reviews: ChosenWine[], identity: WineIdentity): ChosenWine | null {
  const wantId = identity.wsWineId ?? null;
  const wantKey = wineNameKey(identity.producer, identity.wineName);
  const v = norm(identity.vintage != null ? String(identity.vintage) : '');
  // Same wine, same vintage — by Wine-Searcher id when both carry one, else an
  // order-/placement-independent name-token match. Broader than the old exact
  // producer==name==vintage equality, which missed a prior review whose name was
  // split differently (and so spawned a duplicate).
  const matches = reviews.filter((r) =>
    norm(r.vintage != null ? String(r.vintage) : '') === v &&
    ((wantId != null && r.ws_wine_id != null && r.ws_wine_id === wantId) ||
      (!!wantKey && wineNameKey(r.producer, r.wine_name) === wantKey) ||
      // Looser subset fallback — same wine filed with extra winery/appellation
      // words on one side (see wineNameKey hardening + looseWineMatch).
      looseWineMatch(
        { producer: identity.producer, wineName: identity.wineName, vintage: identity.vintage },
        { producer: r.producer, wineName: r.wine_name, grape: r.grape, vintage: r.vintage },
      )),
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


// Pure "what's empty" check for the pre-save prompt. Pass the review's fields
// (the caller omits the optional personal note); returns the labels of the
// empty ones, [] when nothing is missing.
export function missingReviewFields(fields: { label: string; filled: boolean }[]): string[] {
  return fields.filter((f) => !f.filled).map((f) => f.label);
}
