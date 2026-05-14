// Cross-record sync for wine reviews. The same wine identity can live
// in three places at once: a chosen_wines row (proper review), a
// cellar_wines row with is_wishlist=true (wishlist), and a cellar_wines
// row with is_wishlist=false (in the cellar). These helpers keep all
// matching rows in lock-step when the user edits a review on any of the
// three entry points.
//
// Identity match: case-insensitive trimmed producer + wine_name +
// vintage. Same criterion used by the duplicate-wine prompt.
//
// Best-effort: callers handle the primary write themselves; sync is a
// follow-up. Errors are surfaced to the caller via thrown exceptions —
// callers typically log and swallow.

import { findMatchingWishlistWine, updateCellarWine } from '../api/cellar';
import { findMatchingChosenWine, patchChosenWine, createChosenWineFromReview } from '../api/chosenWines';
import { supabase } from '../api/supabase';
import type { CellarWine } from '../types/wine';

export interface ReviewIdentity {
  producer: string | null;
  wineName: string;
  vintage: string | number | null;
}

export interface ReviewFields {
  tastingNote?: string;
  restaurantName?: string;
  city?: string;
  userScore?: number | null;
  reviewDate?: string;
}

function locationString(restaurant: string | undefined, city: string | undefined): string {
  return [restaurant?.trim(), city?.trim()].filter(Boolean).join(', ');
}

// Find every active cellar_wines row for this user that matches the
// identity — both wishlist and non-wishlist, archived rows excluded.
async function findMatchingCellarWines(userId: string, identity: ReviewIdentity): Promise<CellarWine[]> {
  const { data, error } = await supabase
    .from('cellar_wines')
    .select('*')
    .eq('user_id', userId)
    .is('archived_at', null);
  if (error) throw error;
  const list = (data ?? []) as CellarWine[];
  const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();
  const wantedProducer = norm(identity.producer);
  const wantedName = norm(identity.wineName);
  const wantedVintage = identity.vintage != null ? String(identity.vintage).trim() : '';
  return list.filter((w) =>
    norm(w.producer) === wantedProducer &&
    norm(w.wine_name) === wantedName &&
    (w.vintage ?? '').trim() === wantedVintage
  );
}

// Push a review-style edit (made on chosen_wines or on a wine-detail
// review form) onto any matching cellar_wines rows. Wishlist rows get
// the user-facing display fields (tasting_notes, user_notes for
// location) updated too; non-wishlist rows only get review_* fields so
// the AI tasting_notes and Additional Notes (user_notes) aren't
// stomped. Pass excludeCellarWineId when the caller has already
// written to a specific cellar row and shouldn't echo back to itself.
export async function syncReviewToCellar(
  userId: string,
  identity: ReviewIdentity,
  fields: ReviewFields,
  options: { setReviewDate?: boolean; excludeCellarWineId?: string } = {}
): Promise<void> {
  const matches = await findMatchingCellarWines(userId, identity);
  if (matches.length === 0) return;
  const location = locationString(fields.restaurantName, fields.city);
  const reviewDateValue = fields.reviewDate
    ?? (options.setReviewDate ? new Date().toISOString().split('T')[0] : undefined);
  for (const w of matches) {
    if (options.excludeCellarWineId && w.id === options.excludeCellarWineId) continue;
    const updates: Record<string, unknown> = {};
    // Review fields are the same on both wishlist and non-wishlist
    // rows — always safe to update.
    if (fields.userScore !== undefined) updates.review_score = fields.userScore;
    if (fields.restaurantName !== undefined || fields.city !== undefined) {
      updates.review_location = location || null;
    }
    if (reviewDateValue !== undefined) updates.review_date = reviewDateValue;
    // User-display fields only on the wishlist side — the non-wishlist
    // tasting_notes column holds the AI-generated note and user_notes
    // holds the user's Additional Notes (different semantics).
    if (w.is_wishlist) {
      if (fields.tastingNote !== undefined) updates.tasting_notes = fields.tastingNote.trim() || null;
      if (fields.restaurantName !== undefined || fields.city !== undefined) {
        updates.user_notes = location || null;
      }
    }
    if (Object.keys(updates).length === 0) continue;
    await updateCellarWine(w.id, updates as any);
  }
}

// Push an edit made on a wishlist (or wine-detail review form) onto a
// matching chosen_wines row. Patches only the fields the caller asked
// about so the rest of the review (other_observations etc.) is
// preserved.
//
// When no matching row exists: the wishlist path leaves it (a wishlist
// item isn't a review). The cellar wine-detail review form passes
// createIfMissing so the review becomes a first-class chosen_wines row
// and shows up in Your Wine Reviews.
export async function syncEditToChosen(
  userId: string,
  identity: ReviewIdentity,
  fields: ReviewFields,
  options: { createIfMissing?: boolean; region?: string | null } = {}
): Promise<void> {
  const match = await findMatchingChosenWine(userId, identity);
  if (!match) {
    if (options.createIfMissing) {
      await createChosenWineFromReview(userId, identity, fields, options.region ?? null);
    }
    return;
  }
  const updates: Record<string, string | number | null> = {};
  if (fields.tastingNote !== undefined) updates.tasting_note = fields.tastingNote.trim() || null;
  if (fields.userScore !== undefined) updates.user_score = fields.userScore;
  if (fields.restaurantName !== undefined) updates.restaurant_name = fields.restaurantName.trim() || null;
  if (fields.city !== undefined) updates.city = fields.city.trim() || null;
  if (Object.keys(updates).length === 0) return;
  await patchChosenWine(match.id, updates);
}

// Split a wishlist "Discovered at" string back into restaurant_name +
// city. First comma is the separator; if there's no comma the whole
// string is the restaurant name.
export function splitLocationString(raw: string | null | undefined): { restaurantName: string; city: string } {
  const text = (raw ?? '').trim();
  if (!text) return { restaurantName: '', city: '' };
  const idx = text.indexOf(',');
  if (idx === -1) return { restaurantName: text, city: '' };
  return { restaurantName: text.slice(0, idx).trim(), city: text.slice(idx + 1).trim() };
}
