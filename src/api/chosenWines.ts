import { supabase } from './supabase';
import { syncList, type ListSpec } from './listSync';
import { evictCachedLabel } from './labelImageCache';
import { ymdToIso } from '../utils/reviewDate';
import type { ChosenWine, WineRecommendation } from '../types/wine';

// chosen_at is a timestamp. A bare YYYY-MM-DD would be stored as UTC midnight,
// which reads as the previous day west of the UK and sorts before any review
// saved later that same day — so date-only values are anchored at local noon.
function toChosenAt(date: string): string {
  return ymdToIso(date) ?? date;
}

export interface SaveChosenWineInput {
  wine: WineRecommendation;
  scanSessionId: string | null;
  restaurantName: string;
  city: string;
  tastingNote: string;
  otherObservations: string;
  userScore: number | null;
  listPrice: number | null;
  isFavourite: boolean;
  // Optional yyyy-mm-dd. When set, overrides the chosen_at default of
  // now() so the review carries the actual drinking date the user
  // selected on the review modal. Omit / pass null to fall back to now.
  reviewDate?: string | null;
  // Optional "YYYY - YYYY" drinking window the user set on the review.
  userDrinkingWindow?: string | null;
  // Set ONLY for an "Add to this review" entry — the existing review's
  // review_group_id, so this entry joins that review's card. Omit for a new
  // review; the DB defaults a fresh group id.
  reviewGroupId?: string | null;
}

// Manual entry path — used by the +Add flow on Your Wine Reviews, where
// the user enters every field by hand (no scan, no Vinster recommendation
// to seed from). Mirrors saveChosenWine's row shape but accepts flat
// strings and skips the WineRecommendation-only metadata.
export interface ManualSaveChosenWineInput {
  wineName: string;
  producer: string;
  region: string;
  grape?: string | null;
  vintage: number | null;
  restaurantName: string;
  city: string;
  listPrice: number | null;
  currency: string;
  tastingNote: string;
  otherObservations: string;
  userScore: number | null;
  isFavourite: boolean;
  // Source discriminator (migration 042): 'restaurant' or 'other'. Omitted
  // falls back to the DB default 'restaurant'.
  source?: 'restaurant' | 'other';
  // Optional yyyy-mm-dd drinking date — overrides the chosen_at default of
  // now() so Your Wine Reviews carries the date the user actually drank it.
  reviewDate?: string | null;
  // The user's own free-text drinking window opinion.
  userDrinkingWindow?: string | null;
  // Set ONLY for an "Add to this review" entry — see SaveChosenWineInput.
  reviewGroupId?: string | null;
}

export async function saveManualChosenWine(userId: string, input: ManualSaveChosenWineInput): Promise<ChosenWine> {
  const { data, error } = await supabase.from('chosen_wines').insert({
    user_id: userId,
    scan_session_id: null,
    wine_name: input.wineName.trim(),
    producer: input.producer.trim() || null,
    region: input.region.trim() || null,
    appellation: null,
    grape: input.grape?.trim() || null,
    vintage: input.vintage,
    menu_price: input.listPrice,
    currency: input.currency,
    critic_score: null,
    rationale: null,
    vintage_assessment: null,
    drinking_window: null,
    rarity_assessment: null,
    restaurant_name: input.restaurantName.trim() || null,
    city: input.city.trim() || null,
    tasting_note: input.tastingNote.trim() || null,
    other_observations: input.otherObservations.trim() || null,
    user_score: input.userScore,
    is_favourite: input.isFavourite,
    user_drinking_window: input.userDrinkingWindow ?? null,
    // Only write source when the caller asked for a non-default value —
    // omitting the key lets the DB default ('restaurant') kick in for
    // every existing call site that hasn't been updated.
    ...(input.source ? { source: input.source } : {}),
    ...(input.reviewDate ? { chosen_at: toChosenAt(input.reviewDate) } : {}),
    ...(input.reviewGroupId ? { review_group_id: input.reviewGroupId } : {}),
  }).select().single();
  if (error) throw new Error(error.message);
  return data as ChosenWine;
}

// One imported Vivino review → a standalone chosen_wines row.
interface ImportReviewInput {
  producer: string;
  wineName: string;
  vintage: number | null;
  region: string | null;
  style: string | null;          // colour (Red / White / …)
  userScore: number | null;      // /100
  tastingNote: string | null;    // "Your review" (shareable)
  otherObservations: string | null; // "Personal Note" (private)
  location: string | null;
  reviewDate: string | null;     // yyyy-mm-dd
  labelImagePath: string | null; // stored label ref (a Vivino https URL for imports)
  reviewGroupId?: string | null; // shared across repeat tastings of the same wine
}

// Bulk-insert imported reviews as standalone (source 'other') chosen_wines rows.
// Chunked so a big cellar import stays under the request payload limit. Returns
// the new row ids (for assigning the batch to an "Import" folder). No AI/enrich
// at import time — reviews come in flat, intel is generated on demand later.
export async function bulkCreateChosenReviews(userId: string, items: ImportReviewInput[]): Promise<string[]> {
  if (items.length === 0) return [];
  const CHUNK = 500;
  const ids: string[] = [];
  for (let i = 0; i < items.length; i += CHUNK) {
    const rows = items.slice(i, i + CHUNK).map((it) => ({
      user_id: userId,
      scan_session_id: null,
      wine_name: it.wineName.trim() || it.producer.trim() || 'Unnamed wine',
      producer: it.producer.trim() || null,
      region: it.region?.trim() || null,
      vintage: it.vintage,
      style: it.style,
      tasting_note: it.tastingNote?.trim() || null,
      other_observations: it.otherObservations?.trim() || null,
      user_score: it.userScore,
      is_favourite: false,
      restaurant_name: null,
      city: it.location?.trim() || null,
      label_image_path: it.labelImagePath,
      source: 'other' as const,
      ...(it.reviewDate ? { chosen_at: toChosenAt(it.reviewDate) } : {}),
      // Repeat tastings of the same wine share a review_group_id so they collapse
      // into one review card (dated entries), matching Vinster's native model.
      ...(it.reviewGroupId ? { review_group_id: it.reviewGroupId } : {}),
    }));
    const { data, error } = await supabase.from('chosen_wines').insert(rows).select('id');
    if (error) throw new Error(error.message);
    for (const r of data ?? []) ids.push((r as { id: string }).id);
  }
  return ids;
}

// Attach a wine to a restaurant visit as a bottle the user brought (e.g. from
// home). Linked to the scan session and marked source='other' so it shows in
// the visit's "Your Bottles" but never in the List-scan "Bottle Picks".
export async function addSessionBottle(userId: string, input: {
  sessionId: string;
  restaurantName: string | null;
  city: string | null;
  producer: string | null;
  wineName: string;
  region: string | null;
  vintage: number | null;
  // Wine colour / style (red, white, rosé…) — optional.
  style?: string | null;
  // 'restaurant' = a List Bottle (chosen off the restaurant's list);
  // 'other' = an Off-List Bottle (brought to the visit, e.g. from home).
  source: 'restaurant' | 'other';
}): Promise<ChosenWine> {
  const { data, error } = await supabase.from('chosen_wines').insert({
    user_id: userId,
    scan_session_id: input.sessionId,
    wine_name: input.wineName.trim(),
    producer: input.producer?.trim() || null,
    region: input.region?.trim() || null,
    style: input.style?.trim() || null,
    vintage: input.vintage,
    restaurant_name: input.restaurantName?.trim() || null,
    city: input.city?.trim() || null,
    source: input.source,
  }).select().single();
  if (error) throw new Error(error.message);
  return data as ChosenWine;
}

export async function saveChosenWine(userId: string, input: SaveChosenWineInput): Promise<ChosenWine> {
  const { wine, scanSessionId, restaurantName, city, tastingNote, otherObservations, userScore, listPrice, isFavourite, reviewDate, userDrinkingWindow } = input;
  const row: Record<string, unknown> = {
    user_id: userId,
    scan_session_id: scanSessionId,
    wine_name: wine.name,
    producer: wine.producer,
    region: wine.region,
    appellation: wine.appellation ?? null,
    grape: wine.grape ?? null,
    vintage: wine.vintage,
    // List price the user confirmed in the review modal, falling back
    // to the price Vinster pulled off the menu for the scan.
    menu_price: listPrice ?? wine.menuPrice,
    currency: wine.currency,
    // "Price paid" — auto-inserted by Vinster from the confirmed/menu price so a
    // review saved straight from a wine-list scan already carries the price paid
    // without the user re-entering it (at a restaurant the menu price IS the
    // price paid). Still fully editable on the review afterwards.
    purchase_price: listPrice ?? wine.menuPrice ?? null,
    purchase_price_currency: (listPrice ?? wine.menuPrice) != null ? (wine.currency ?? null) : null,
    critic_score: wine.criticScore,
    rationale: wine.rationale,
    vintage_assessment: wine.vintageAssessment,
    drinking_window: wine.drinkingWindow,
    rarity_assessment: wine.rarityAssessment,
    restaurant_name: restaurantName || null,
    city: city || null,
    tasting_note: tastingNote || null,
    other_observations: otherObservations || null,
    user_score: userScore,
    user_drinking_window: userDrinkingWindow ?? null,
    is_favourite: isFavourite,
  };
  // Only set chosen_at when the user picked a specific date — the DB
  // defaults it to now() otherwise.
  if (reviewDate) row.chosen_at = toChosenAt(reviewDate);
  // Set the group only for an "Add to this review" entry; a new review lets the
  // DB default a fresh group id.
  if (input.reviewGroupId) row.review_group_id = input.reviewGroupId;
  const { data, error } = await supabase.from('chosen_wines').insert(row).select().single();
  if (error) throw new Error(error.message);
  return data as ChosenWine;
}

export interface UpdateChosenWineInput {
  restaurantName: string;
  city: string;
  tastingNote: string;
  otherObservations: string;
  userScore: number | null;
  listPrice: number | null;
  isFavourite: boolean;
  // Purchase price (migration 044). Optional so callers that don't touch it
  // are unaffected; only written to the row when explicitly provided.
  purchasePrice?: number | null;
  purchasePriceCurrency?: string | null;
  // Optional "YYYY - YYYY" drinking window; only written when provided.
  userDrinkingWindow?: string | null;
}

export async function updateChosenWine(id: string, input: UpdateChosenWineInput): Promise<void> {
  const updates: Record<string, unknown> = {
    restaurant_name: input.restaurantName || null,
    city: input.city || null,
    tasting_note: input.tastingNote || null,
    other_observations: input.otherObservations || null,
    user_score: input.userScore,
    menu_price: input.listPrice,
    is_favourite: input.isFavourite,
  };
  if (input.purchasePrice !== undefined) {
    updates.purchase_price = input.purchasePrice;
    updates.purchase_price_currency = input.purchasePriceCurrency ?? null;
  }
  if (input.userDrinkingWindow !== undefined) updates.user_drinking_window = input.userDrinkingWindow;
  const { data, error } = await supabase.from('chosen_wines').update(updates).eq('id', id).select('id');
  if (error) throw new Error(error.message);
  // RLS refusing the update returns no rows and no error — not a save.
  if (!data || data.length === 0) {
    throw new Error('That review could not be saved — please pull to refresh (you may need to sign in again).');
  }
}

export async function deleteChosenWine(id: string): Promise<void> {
  const { data, error } = await supabase.from('chosen_wines').delete().eq('id', id).select('id, label_image_path');
  if (error) throw new Error(error.message);
  // Verify a row was actually removed — a stale/expired session makes RLS match
  // zero rows and return no error, which would otherwise read as a fake success.
  if (!data || data.length === 0) {
    throw new Error('That review could not be deleted — please pull to refresh (you may need to sign in again).');
  }
  await removeOrphanedReviewPhoto(id, (data[0] as { label_image_path: string | null }).label_image_path);
}

// Best-effort: remove a deleted review's own label photo from storage. Only a
// photo uploaded for this row (<user>/<rowId>.jpg) qualifies — never a cellar
// bottle's photo it borrowed — and only once no other row points at it.
async function removeOrphanedReviewPhoto(rowId: string, path: string | null): Promise<void> {
  if (!path || !path.endsWith(`/${rowId}.jpg`)) return;
  try {
    const stillUsed = await Promise.all(['chosen_wines', 'cellar_wines', 'labels'].map((table) =>
      supabase.from(table).select('id', { count: 'exact', head: true }).eq('label_image_path', path)));
    if (stillUsed.some((r) => r.error || (r.count ?? 0) > 0)) return;
    await supabase.storage.from('wine-labels').remove([path]);
    evictCachedLabel(path);
  } catch { /* an orphaned file is harmless; never block the delete */ }
}

// Delete many chosen_wines rows by id, chunked so a large batch (e.g. clearing a
// whole import folder of thousands of reviews) stays under the request limit.
export async function bulkDeleteChosenWines(ids: string[]): Promise<void> {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  const CHUNK = 500;
  for (let i = 0; i < unique.length; i += CHUNK) {
    const slice = unique.slice(i, i + CHUNK);
    const { error } = await supabase.from('chosen_wines').delete().in('id', slice);
    if (error) throw new Error(error.message);
  }
}

// Clear the review CONTENT off a chosen wine without deleting the row, so a
// restaurant bottle pick stays on its visit. It returns to "awaiting review"
// unless `dismiss` also hides it from that list.
export async function clearChosenReview(id: string, options: { dismiss?: boolean } = {}): Promise<void> {
  const { data, error } = await supabase
    .from('chosen_wines')
    .update({
      tasting_note: null,
      other_observations: null,
      user_score: null,
      ...(options.dismiss ? { review_dismissed: true } : {}),
    })
    .eq('id', id)
    .select('id');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    throw new Error('That review could not be cleared — please pull to refresh (you may need to sign in again).');
  }
}

// A user's reviews can run to thousands (a full Vivino import is ~9,000), so
// the app keeps its own copy and syncs only what changed (see listSync).
const chosenList = (userId: string): ListSpec<ChosenWine> => ({
  table: 'chosen_wines',
  ownerId: userId,
  stamp: 'updated_at',
  orderBy: { column: 'chosen_at', ascending: false },
});

export async function fetchChosenWines(userId: string, prev?: ChosenWine[]): Promise<ChosenWine[]> {
  return syncList(chosenList(userId), prev);
}

// Partial update — touches only the fields given.
export async function patchChosenWine(
  id: string,
  updates: Partial<{
    restaurant_name: string | null;
    city: string | null;
    tasting_note: string | null;
    other_observations: string | null;
    user_score: number | null;
    purchase_price: number | null;
    purchase_price_currency: string | null;
    estimated_value: number | null;
    estimated_value_currency: string | null;
    estimated_value_at: string | null;
    user_drinking_window: string | null;
    label_image_path: string | null;
    ws_wine_id: string | null;
    ws_wine_name: string | null;
    critic_score: number | null;
    rationale: string | null;      // Vinster's Note, persisted on first generation
    wine_name: string;
    producer: string | null;
    region: string | null;
    vintage: number | null;
    style: string | null;
    chosen_at: string;              // when the wine was drunk / reviewed (ISO)
    review_dismissed: boolean;      // hide from Your Wine Reviews' awaiting list
    is_favourite: boolean;          // starred from the review thumbnail
    scan_session_id: string | null; // link an existing review to a restaurant visit
  }>
): Promise<void> {
  const { data, error } = await supabase.from('chosen_wines').update(updates).eq('id', id).select('id');
  if (error) throw new Error(error.message);
  // RLS refusing the update returns no rows and no error — not a save.
  if (!data || data.length === 0) {
    throw new Error('That review could not be saved — please pull to refresh (you may need to sign in again).');
  }
}

// Take a wine off a restaurant visit without deleting its review. The
// restaurant name/city go too: Your Restaurant Reviews also matches unlinked
// wines to a visit by restaurant name, so leaving them would put it straight back.
export async function unlinkFromSession(id: string): Promise<void> {
  const { data, error } = await supabase
    .from('chosen_wines')
    .update({ scan_session_id: null, restaurant_name: null, city: null })
    .eq('id', id)
    .select('id');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('That wine could not be removed — please refresh and try again.');
}

// Keep the wines on a visit in step when its restaurant is renamed or its city
// changes, so their reviews read "You had this at …" with the new details.
export async function updateSessionRestaurant(
  sessionId: string,
  details: { restaurantName?: string | null; city?: string | null },
): Promise<void> {
  const updates: Record<string, string | null> = {};
  if (details.restaurantName !== undefined) updates.restaurant_name = details.restaurantName?.trim() || null;
  if (details.city !== undefined) updates.city = details.city?.trim() || null;
  if (Object.keys(updates).length === 0) return;
  const { error } = await supabase.from('chosen_wines').update(updates).eq('scan_session_id', sessionId);
  if (error) throw new Error(error.message);
}
