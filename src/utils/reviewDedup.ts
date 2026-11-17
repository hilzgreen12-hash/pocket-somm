import type { ChosenWine } from '../types/wine';
import { wineNameKey, looseWineMatch } from './wineIdentity';

// Helpers for the "you've reviewed this wine before" prompt: when a user
// reviews a wine they already have a review of, the review modals offer to add
// a new dated entry to it or start a separate review.

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

// The most recent chosen_wines row for the same wine and vintage, or null.
// Matches by Wine-Searcher id when both sides carry one, else by an order- and
// placement-independent name key, else by the looser subset match (the same
// wine filed with extra winery/appellation words on one side).
export function findExistingReview(reviews: ChosenWine[], identity: WineIdentity): ChosenWine | null {
  const wantId = identity.wsWineId ?? null;
  const wantKey = wineNameKey(identity.producer, identity.wineName);
  const v = norm(identity.vintage != null ? String(identity.vintage) : '');
  const matches = reviews.filter((r) =>
    norm(r.vintage != null ? String(r.vintage) : '') === v &&
    ((wantId != null && r.ws_wine_id != null && r.ws_wine_id === wantId) ||
      (!!wantKey && wineNameKey(r.producer, r.wine_name) === wantKey) ||
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

// Pure "what's empty" check for the pre-save prompt. Pass the review's fields
// (the caller omits the optional personal note); returns the labels of the
// empty ones, [] when nothing is missing.
export function missingReviewFields(fields: { label: string; filled: boolean }[]): string[] {
  return fields.filter((f) => !f.filled).map((f) => f.label);
}
