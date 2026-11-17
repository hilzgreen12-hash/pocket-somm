import type { ChosenWine } from '../types/wine';
import type { RestaurantVisit } from '../hooks/useScanHistory';

// One definition of "a restaurant visit" and its review, shared by the Review
// tab carousel and Your Restaurant Reviews so the two always show the same
// visits and the same counts.

export const UNNAMED_RESTAURANT = 'Unnamed restaurant';

const RATING_KEYS = [
  'ratingOverall', 'ratingFood', 'ratingService', 'ratingWineList',
  'ratingAtmosphere', 'ratingValue', 'ratingGlassware',
] as const;

// Reviewed = at least one star rating or a written note. A visit without either
// is "awaiting review" (typically a restaurant named on a wine-list result).
export function hasRestaurantReview(v: RestaurantVisit): boolean {
  return RATING_KEYS.some((k) => v[k] != null) || !!v.restaurantNote?.trim();
}

// Session ids that have at least one wine linked to them.
export function sessionsWithWines(chosenWines: ChosenWine[]): Set<string> {
  return new Set(chosenWines.map((cw) => cw.scan_session_id).filter((id): id is string => !!id));
}

// Every scan creates a nameless scan_sessions row (for Recent Scans), so a row
// only counts as a restaurant visit once the user has put something on it.
// Ratings-only, photo-only and wines-only visits count too — otherwise they'd be
// saved but impossible to find or delete.
export function isRestaurantVisit(v: RestaurantVisit, withWines: Set<string>): boolean {
  return !!v.restaurantName?.trim() || hasRestaurantReview(v) || !!v.restaurantPhotoPath || withWines.has(v.id);
}

// "N Restaurants · M Reviews": restaurants are distinct names (each unnamed
// visit counts on its own); reviews are visits that carry a review.
export function visitStats(visits: RestaurantVisit[]): { restaurants: number; reviews: number } {
  const names = new Set(visits.map((v) => v.restaurantName?.trim().toLowerCase() || `#${v.id}`));
  return { restaurants: names.size, reviews: visits.filter(hasRestaurantReview).length };
}

// "4 Nov 2026" (short) or "4 November 2026" (long).
export function formatVisitDate(iso: string | null | undefined, month: 'short' | 'long' = 'short'): string {
  return iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month, year: 'numeric' }) : '';
}
