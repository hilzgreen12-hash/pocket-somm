import { supabase } from './supabase';
import type { Pairing, WineDetailsComplete } from '../types/wine';

export interface ChosenRecipe {
  id: string;
  user_id: string;
  chosen_at: string;
  dish_name: string;
  chef_inspiration: string | null;
  pairing_notes: string | null;
  recipe: Pairing['recipe'] | null;
  wine_pairing: WineDetailsComplete | null;
  cooked_at_location: string | null;
  city: string | null;
  cooking_note: string | null;
  other_observations: string | null;
  user_score: number | null;
}

export interface SaveChosenRecipeInput {
  pairing: Pairing;
  wine: WineDetailsComplete | null;
  cookedAtLocation: string;
  city: string;
  cookingNote: string;
  otherObservations: string;
  userScore: number | null;
}

export async function saveChosenRecipe(userId: string, input: SaveChosenRecipeInput): Promise<void> {
  const { pairing, wine, cookedAtLocation, city, cookingNote, otherObservations, userScore } = input;
  const { error } = await supabase.from('chosen_recipes').insert({
    user_id: userId,
    dish_name: pairing.dishName,
    chef_inspiration: pairing.chefInspiration ?? null,
    pairing_notes: pairing.pairingNotes ?? null,
    recipe: pairing.recipe ?? null,
    wine_pairing: wine ?? null,
    cooked_at_location: cookedAtLocation || null,
    city: city || null,
    cooking_note: cookingNote || null,
    other_observations: otherObservations || null,
    user_score: userScore,
  });
  if (error) throw error;
}

export interface UpdateChosenRecipeInput {
  cookedAtLocation: string;
  city: string;
  cookingNote: string;
  otherObservations: string;
  userScore: number | null;
}

export async function updateChosenRecipe(id: string, input: UpdateChosenRecipeInput): Promise<void> {
  const { error } = await supabase.from('chosen_recipes').update({
    cooked_at_location: input.cookedAtLocation || null,
    city: input.city || null,
    cooking_note: input.cookingNote || null,
    other_observations: input.otherObservations || null,
    user_score: input.userScore,
  }).eq('id', id);
  if (error) throw error;
}

export async function fetchChosenRecipes(userId: string): Promise<ChosenRecipe[]> {
  const { data, error } = await supabase
    .from('chosen_recipes')
    .select('*')
    .eq('user_id', userId)
    .order('chosen_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ChosenRecipe[];
}

export async function deleteChosenRecipe(id: string): Promise<void> {
  const { error } = await supabase.from('chosen_recipes').delete().eq('id', id);
  if (error) throw error;
}
