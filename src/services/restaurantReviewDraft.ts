// Unsaved edits to a restaurant review, kept while the person steps away from
// the form (to a wine's review, its Wine Intel, Edit Wine Name…) and put back
// when the form reopens for that visit — so nothing is saved until they press
// Save, and nothing they typed is lost. Held for this app session only.

export interface RestaurantReviewDraft {
  restaurantName: string;
  cityValue: string;
  note: string;
  overall: number | null;
  food: number | null;
  wineList: number | null;
  service: number | null;
  atmosphere: number | null;
  glassware: number | null;
  value: number | null;
  dateValue: string;
}

const drafts = new Map<string, RestaurantReviewDraft>();

export function getRestaurantDraft(sessionId: string | null | undefined): RestaurantReviewDraft | null {
  return sessionId ? drafts.get(sessionId) ?? null : null;
}
export function setRestaurantDraft(sessionId: string, draft: RestaurantReviewDraft): void {
  drafts.set(sessionId, draft);
}
export function clearRestaurantDraft(sessionId: string | null | undefined): void {
  if (sessionId) drafts.delete(sessionId);
}
