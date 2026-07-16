import { supabase } from './supabase';
import type { ChosenWine, WineRecommendation } from '../types/wine';

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
}

// Manual entry path — used by the +Add flow on Your Wine Reviews, where
// the user enters every field by hand (no scan, no Vinster recommendation
// to seed from). Mirrors saveChosenWine's row shape but accepts flat
// strings and skips the WineRecommendation-only metadata.
export interface ManualSaveChosenWineInput {
  wineName: string;
  producer: string;
  region: string;
  vintage: number | null;
  restaurantName: string;
  city: string;
  listPrice: number | null;
  currency: string;
  tastingNote: string;
  otherObservations: string;
  userScore: number | null;
  isFavourite: boolean;
  // Source discriminator (migration 042). Omitted = falls back to the
  // DB default 'restaurant'. The "Review without adding" path in
  // /label/results passes 'other' so those reviews can be filtered out
  // of the Restaurant Wines bucket in Your Wine Reviews.
  source?: 'restaurant' | 'other';
  // Optional yyyy-mm-dd drinking date — overrides the chosen_at default of
  // now() so Your Wine Reviews carries the date the user actually drank it.
  reviewDate?: string | null;
  // The user's own free-text drinking window opinion.
  userDrinkingWindow?: string | null;
}

export async function saveManualChosenWine(userId: string, input: ManualSaveChosenWineInput): Promise<ChosenWine> {
  const { data, error } = await supabase.from('chosen_wines').insert({
    user_id: userId,
    scan_session_id: null,
    wine_name: input.wineName.trim(),
    producer: input.producer.trim() || null,
    region: input.region.trim() || null,
    appellation: null,
    grape: null,
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
    ...(input.reviewDate ? { chosen_at: input.reviewDate } : {}),
  }).select().single();
  if (error) throw new Error(error.message);
  return data as ChosenWine;
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
  const { wine, scanSessionId, restaurantName, city, tastingNote, otherObservations, userScore, listPrice, isFavourite, reviewDate } = input;
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
    is_favourite: isFavourite,
  };
  // Only set chosen_at when the user picked a specific date — letting the
  // DB default to now() otherwise. Treat as a date-only value (no time).
  if (reviewDate) row.chosen_at = reviewDate;
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
  // Purchase price + review-level wish-list flag (migrations 044/045).
  // Optional so callers that don't touch them are unaffected; each is
  // only written to the row when explicitly provided.
  purchasePrice?: number | null;
  purchasePriceCurrency?: string | null;
  wishlist?: boolean;
  // Identity carried through so the post-update sync can find any
  // matching wishlist row without an extra round-trip. The chosen_wines
  // update endpoint itself doesn't change these fields.
  producer: string | null;
  wineName: string;
  vintage: number | null;
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
  if (input.wishlist !== undefined) updates.wishlist = input.wishlist;
  const { error } = await supabase.from('chosen_wines').update(updates).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteChosenWine(id: string): Promise<void> {
  const { data, error } = await supabase.from('chosen_wines').delete().eq('id', id).select('id');
  if (error) throw new Error(error.message);
  // Verify a row was actually removed — a stale/expired session makes RLS match
  // zero rows and return no error, which would otherwise read as a fake success.
  if (!data || data.length === 0) {
    throw new Error('That review could not be deleted — please pull to refresh (you may need to sign in again).');
  }
}

// Clear the review CONTENT off a chosen wine without deleting the row — so a
// restaurant bottle pick returns to "awaiting review" instead of vanishing.
export async function clearChosenReview(id: string): Promise<void> {
  const { data, error } = await supabase
    .from('chosen_wines')
    .update({ tasting_note: null, other_observations: null, user_score: null })
    .eq('id', id)
    .select('id');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    throw new Error('That review could not be cleared — please pull to refresh (you may need to sign in again).');
  }
}

export async function fetchChosenWines(userId: string): Promise<ChosenWine[]> {
  const { data, error } = await supabase
    .from('chosen_wines')
    .select('*')
    .eq('user_id', userId)
    .order('chosen_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// Look up the most recent chosen_wines (review) row for this user that
// matches a wine identity. Used by the wishlist sync flow so that edits
// to a wishlist tasting note or location push the same values back to
// the matching review.
export async function findMatchingChosenWine(
  userId: string,
  identity: { producer: string | null; wineName: string; vintage: string | number | null }
): Promise<ChosenWine | null> {
  const { data, error } = await supabase
    .from('chosen_wines')
    .select('*')
    .eq('user_id', userId)
    .order('chosen_at', { ascending: false });
  if (error) throw error;
  const list = (data ?? []) as ChosenWine[];
  const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();
  const wantedProducer = norm(identity.producer);
  const wantedName = norm(identity.wineName);
  const wantedVintage = identity.vintage != null ? String(identity.vintage).trim() : '';
  return list.find((w) =>
    norm(w.producer) === wantedProducer &&
    norm(w.wine_name) === wantedName &&
    (w.vintage != null ? String(w.vintage).trim() : '') === wantedVintage
  ) ?? null;
}

// Create a chosen_wines row from a review made directly on a cellar
// bottle. Used when the user reviews a wine they own but have never
// reviewed via a List scan — without this the review would live only on
// cellar_wines and never surface in Your Wine Reviews. Relies on column
// defaults for currency / chosen_at / is_favourite.
export async function createChosenWineFromReview(
  userId: string,
  identity: { producer: string | null; wineName: string; vintage: string | number | null },
  fields: { userScore?: number | null; restaurantName?: string; city?: string; reviewDate?: string; tastingNote?: string },
  region: string | null,
): Promise<void> {
  const v = identity.vintage;
  const vintageInt =
    v == null || v === '' || !Number.isFinite(Number(v)) ? null : Math.trunc(Number(v));
  const row: Record<string, unknown> = {
    user_id: userId,
    scan_session_id: null,
    wine_name: identity.wineName.trim(),
    producer: identity.producer?.trim() || null,
    region: region?.trim() || null,
    vintage: vintageInt,
    restaurant_name: fields.restaurantName?.trim() || null,
    city: fields.city?.trim() || null,
    tasting_note: fields.tastingNote?.trim() || null,
    user_score: fields.userScore ?? null,
  };
  // chosen_at defaults to now(); when the user gave a drink date, use
  // that instead so Your Wine Reviews sorts by when the wine was drunk.
  if (fields.reviewDate) row.chosen_at = fields.reviewDate;
  const { error } = await supabase.from('chosen_wines').insert(row);
  if (error) throw new Error(error.message);
}

// Partial update used by the wishlist→review sync path. Lets the caller
// touch only the fields that actually changed on the wishlist side rather
// than overwriting everything with the EditChosenWineModal payload shape.
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
    wishlist: boolean;
    user_drinking_window: string | null;
    label_image_path: string | null;
    critic_score: number | null;
    critic_score_note: string | null;
    wine_name: string;
    producer: string | null;
    region: string | null;
    vintage: number | null;
    style: string | null;
    chosen_at: string;              // when the wine was drunk / reviewed (ISO)
  }>
): Promise<void> {
  const { error } = await supabase.from('chosen_wines').update(updates).eq('id', id);
  if (error) throw new Error(error.message);
}
