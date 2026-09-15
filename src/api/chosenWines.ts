import { supabase } from './supabase';
import { wineNameKey } from '../utils/wineIdentity';
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
    ...(input.reviewGroupId ? { review_group_id: input.reviewGroupId } : {}),
  }).select().single();
  if (error) throw new Error(error.message);
  return data as ChosenWine;
}

// One imported Vivino review → a standalone chosen_wines row.
export interface ImportReviewInput {
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
      ...(it.reviewDate ? { chosen_at: it.reviewDate } : {}),
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
  // Only set chosen_at when the user picked a specific date — letting the
  // DB default to now() otherwise. Treat as a date-only value (no time).
  if (reviewDate) row.chosen_at = reviewDate;
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
  // Purchase price + review-level wish-list flag (migrations 044/045).
  // Optional so callers that don't touch them are unaffected; each is
  // only written to the row when explicitly provided.
  purchasePrice?: number | null;
  purchasePriceCurrency?: string | null;
  wishlist?: boolean;
  // Optional "YYYY - YYYY" drinking window; only written when provided.
  userDrinkingWindow?: string | null;
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
  if (input.userDrinkingWindow !== undefined) updates.user_drinking_window = input.userDrinkingWindow;
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

// Fetch ALL of a user's chosen_wines, paging past PostgREST's ~1000-row cap. A
// large imported review history (e.g. a full Vivino export, ~9000) would silently
// truncate to the first 1000 on a single request, so we loop in pages until a
// short page signals the end.
async function fetchAllChosenWines(userId: string): Promise<ChosenWine[]> {
  const PAGE = 1000;
  const out: ChosenWine[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('chosen_wines')
      .select('*')
      .eq('user_id', userId)
      .order('chosen_at', { ascending: false })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    const batch = (data ?? []) as ChosenWine[];
    out.push(...batch);
    if (batch.length < PAGE) break;
  }
  return out;
}

export async function fetchChosenWines(userId: string): Promise<ChosenWine[]> {
  return fetchAllChosenWines(userId);
}

// Look up the most recent chosen_wines (review) row for this user that
// matches a wine identity. Used by the wishlist sync flow so that edits
// to a wishlist tasting note or location push the same values back to
// the matching review.
export async function findMatchingChosenWine(
  userId: string,
  identity: { producer: string | null; wineName: string; vintage: string | number | null; wsWineId?: string | null }
): Promise<ChosenWine | null> {
  // Paged so a match can be found even in a >1000-row review history (otherwise
  // auto-link / wishlist-sync would only see the most recent 1000).
  const list = await fetchAllChosenWines(userId);

  const wantId = identity.wsWineId ?? null;
  const wantKey = wineNameKey(identity.producer, identity.wineName);
  const wantVintage = identity.vintage != null ? String(identity.vintage).trim() : '';
  const sameVintage = (w: ChosenWine) => (w.vintage != null ? String(w.vintage).trim() : '') === wantVintage;
  const hasReview = (w: ChosenWine) =>
    !!((w.tasting_note && w.tasting_note.trim()) || (w.other_observations && w.other_observations.trim()) || w.user_score != null);

  // Same wine, same vintage — by Wine-Searcher id (authoritative) when both
  // carry one, else an order-/placement-independent name-token match. This is
  // broader than the old exact producer==name==vintage equality, which missed
  // reviews whose producer / name were split differently from the cellar wine
  // (the "import review didn't link" bug).
  const isMatch = (w: ChosenWine) =>
    sameVintage(w) && (
      (wantId != null && w.ws_wine_id != null && w.ws_wine_id === wantId) ||
      (!!wantKey && wineNameKey(w.producer, w.wine_name) === wantKey)
    );

  const matches = list.filter(isMatch);
  if (matches.length === 0) return null;
  // Prefer a match that actually carries a review, so an import/link lands on
  // the real review rather than a bare bottle-pick of the same wine.
  return matches.find(hasReview) ?? matches[0];
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
    ws_wine_id: string | null;
    ws_wine_name: string | null;
    critic_score: number | null;
    critic_score_note: string | null;
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
  const { error } = await supabase.from('chosen_wines').update(updates).eq('id', id);
  if (error) throw new Error(error.message);
}
