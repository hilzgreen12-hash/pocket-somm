import { supabase } from './supabase';
import type { ChosenWine, WineRecommendation } from '../types/wine';

export interface SaveChosenWineInput {
  wine: WineRecommendation;
  restaurantName: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  tastingNote: string;
  userScore: number | null;
}

export async function saveChosenWine(userId: string, input: SaveChosenWineInput): Promise<void> {
  const { wine, restaurantName, address, city, latitude, longitude, tastingNote, userScore } = input;
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
    address: address || null,
    city: city || null,
    latitude,
    longitude,
    tasting_note: tastingNote || null,
    user_score: userScore,
  });
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
