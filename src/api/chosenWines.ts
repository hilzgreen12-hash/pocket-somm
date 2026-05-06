import { supabase } from './supabase';
import type { ChosenWine, WineRecommendation } from '../types/wine';

export interface SaveChosenWineInput {
  wine: WineRecommendation;
  restaurantName: string;
  city: string;
  tastingNote: string;
  otherObservations: string;
  userScore: number | null;
}

export async function saveChosenWine(userId: string, input: SaveChosenWineInput): Promise<void> {
  const { wine, restaurantName, city, tastingNote, otherObservations, userScore } = input;
  await supabase.from('chosen_wines').insert({
    user_id: userId,
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
  });
}

export interface UpdateChosenWineInput {
  restaurantName: string;
  city: string;
  tastingNote: string;
  otherObservations: string;
  userScore: number | null;
}

export async function updateChosenWine(id: string, input: UpdateChosenWineInput): Promise<void> {
  await supabase.from('chosen_wines').update({
    restaurant_name: input.restaurantName || null,
    city: input.city || null,
    tasting_note: input.tastingNote || null,
    other_observations: input.otherObservations || null,
    user_score: input.userScore,
  }).eq('id', id);
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
