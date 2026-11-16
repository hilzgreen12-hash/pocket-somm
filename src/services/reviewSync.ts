// Cross-record sync for wine reviews. The same wine can carry a review in two
// places: a chosen_wines row (Your Wine Reviews) and a cellar_wines row (the
// cellar wine card's "Your Review"). These helpers keep the matching rows in
// lock-step when the user edits a review in either place.
//
// Identity match: case-insensitive trimmed producer + wine_name +
// vintage. Same criterion used by the duplicate-wine prompt.
//
// Best-effort: callers handle the primary write themselves; sync is a
// follow-up. Errors are surfaced to the caller via thrown exceptions —
// callers typically log and swallow.

import { updateCellarWine } from '../api/cellar';
import { findMatchingChosenWine, patchChosenWine, createChosenWineFromReview } from '../api/chosenWines';
import { supabase } from '../api/supabase';
import type { CellarWine } from '../types/wine';

interface ReviewIdentity {
  producer: string | null;
  wineName: string;
  vintage: string | number | null;
}

interface ReviewFields {
  tastingNote?: string;
  restaurantName?: string;
  city?: string;
  userScore?: number | null;
  reviewDate?: string;
  // Personal Notes + the user's drinking-window opinion — synced so a chosen
  // twin created/updated from a cellar review carries the FULL review, not just
  // note + score (otherwise Your Wine Reviews opens the twin with these blank).
  otherObservations?: string;
  drinkingWindow?: string;
  // Only used when createIfMissing spawns a fresh chosen_wines row (a cellar
  // review that had no chosen twin) — carries the bottle's label photo across so
  // the new review card / carousel thumbnail isn't blank.
  labelImagePath?: string | null;
}

function locationString(restaurant: string | undefined, city: string | undefined): string {
  return [restaurant?.trim(), city?.trim()].filter(Boolean).join(', ');
}

// Find every active (non-archived) cellar_wines row for this user that matches
// the identity.
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

// Push a review-style edit (made on chosen_wines or on a wine-detail review
// form) onto any matching cellar_wines rows. Only the review_* fields are
// written, so the AI tasting_notes and the user's Additional Notes
// (user_notes) are never overwritten. Pass excludeCellarWineId when the caller
// has already written to a specific cellar row and shouldn't echo back to it.
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
    if (fields.userScore !== undefined) updates.review_score = fields.userScore;
    if (fields.restaurantName !== undefined || fields.city !== undefined) {
      updates.review_location = location || null;
    }
    if (reviewDateValue !== undefined) updates.review_date = reviewDateValue;
    if (Object.keys(updates).length === 0) continue;
    await updateCellarWine(w.id, updates as any);
  }
}

// Clear the review fields on any matching cellar_wines rows. Called when the
// user deletes a review in Your Wine Reviews — the cellar wine card's "Your
// Review" should empty out too (the review was the same thing). Leaves the
// bottle itself, its price, AI tasting note and private Personal Notes intact.
export async function clearReviewOnCellar(
  userId: string,
  identity: ReviewIdentity
): Promise<void> {
  const matches = await findMatchingCellarWines(userId, identity);
  for (const w of matches) {
    await updateCellarWine(w.id, {
      // Clear review_entries (the source of truth) + user_notes too — clearing
      // only the flat fields left the wine card still showing the full review and
      // let Your Wine Reviews re-derive it straight back as a 'cellar' item.
      review_entries: [],
      review_score: null,
      review_note: null,
      review_location: null,
      review_date: null,
      user_notes: null,
      user_drinking_window: null,
    } as any);
  }
}

// Push an edit made on a cellar wine card's review form onto the matching
// chosen_wines row. Patches only the fields the caller asked about so the rest
// of the review (other_observations etc.) is preserved.
//
// When no matching row exists, createIfMissing makes the review a first-class
// chosen_wines row so it shows up in Your Wine Reviews.
export async function syncEditToChosen(
  userId: string,
  identity: ReviewIdentity,
  fields: ReviewFields,
  options: { createIfMissing?: boolean; region?: string | null } = {}
): Promise<void> {
  const match = await findMatchingChosenWine(userId, identity);
  if (!match) {
    // Only spawn a chosen twin for a review with actual review CONTENT — a
    // tasting note or a score. A save carrying only Personal Notes / a location
    // or date isn't a review, so it shouldn't create a (UI-invisible) chosen row.
    const hasContent = !!(fields.tastingNote && fields.tastingNote.trim()) || fields.userScore != null;
    if (options.createIfMissing && hasContent) {
      await createChosenWineFromReview(userId, identity, fields, options.region ?? null);
    }
    return;
  }
  const updates: Record<string, string | number | null> = {};
  if (fields.tastingNote !== undefined) updates.tasting_note = fields.tastingNote.trim() || null;
  if (fields.userScore !== undefined) updates.user_score = fields.userScore;
  if (fields.restaurantName !== undefined) updates.restaurant_name = fields.restaurantName.trim() || null;
  if (fields.city !== undefined) updates.city = fields.city.trim() || null;
  // Keep Personal Notes + drinking window in lock-step too, so editing a cellar
  // review doesn't leave a stale/blank twin in Your Wine Reviews.
  if (fields.otherObservations !== undefined) updates.other_observations = fields.otherObservations.trim() || null;
  if (fields.drinkingWindow !== undefined) updates.user_drinking_window = fields.drinkingWindow.trim() || null;
  if (Object.keys(updates).length === 0) return;
  await patchChosenWine(match.id, updates);
}

// Split a "restaurant, city" location string back into restaurant_name +
// city. First comma is the separator; if there's no comma the whole
// string is the restaurant name.
export function splitLocationString(raw: string | null | undefined): { restaurantName: string; city: string } {
  const text = (raw ?? '').trim();
  if (!text) return { restaurantName: '', city: '' };
  const idx = text.indexOf(',');
  if (idx === -1) return { restaurantName: text, city: '' };
  return { restaurantName: text.slice(0, idx).trim(), city: text.slice(idx + 1).trim() };
}
