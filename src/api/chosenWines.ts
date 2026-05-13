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
}

export async function saveChosenWine(userId: string, input: SaveChosenWineInput): Promise<ChosenWine> {
  const { wine, scanSessionId, restaurantName, city, tastingNote, otherObservations, userScore } = input;
  const { data, error } = await supabase.from('chosen_wines').insert({
    user_id: userId,
    scan_session_id: scanSessionId,
    wine_name: wine.name,
    producer: wine.producer,
    region: wine.region,
    appellation: wine.appellation ?? null,
    grape: wine.grape ?? null,
    vintage: wine.vintage,
    menu_price: wine.menuPrice,
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
  }).select().single();
  if (error) throw new Error(error.message);
  return data as ChosenWine;
}

export interface UpdateChosenWineInput {
  restaurantName: string;
  city: string;
  tastingNote: string;
  otherObservations: string;
  userScore: number | null;
  // Identity carried through so the post-update sync can find any
  // matching wishlist row without an extra round-trip. The chosen_wines
  // update endpoint itself doesn't change these fields.
  producer: string | null;
  wineName: string;
  vintage: number | null;
}

export async function updateChosenWine(id: string, input: UpdateChosenWineInput): Promise<void> {
  const { error } = await supabase.from('chosen_wines').update({
    restaurant_name: input.restaurantName || null,
    city: input.city || null,
    tasting_note: input.tastingNote || null,
    other_observations: input.otherObservations || null,
    user_score: input.userScore,
  }).eq('id', id);
  if (error) throw new Error(error.message);
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
  }>
): Promise<void> {
  const { error } = await supabase.from('chosen_wines').update(updates).eq('id', id);
  if (error) throw new Error(error.message);
}
