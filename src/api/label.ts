import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from './supabase';
import type { WineDetails, WineIntelligence, Pairing, WineDetailsComplete, DietaryFilters } from '../types/wine';

// Use the supabase client so the user's JWT is attached to every edge
// function call (when signed in). This makes auth checks possible inside the
// functions and gives us the right identity in logs. Falls back to the anon
// key automatically when no session exists.
async function invokeFunction(name: string, body: unknown): Promise<unknown> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    const message = (error as any)?.message || `${name} error`;
    throw new Error(`${name}: ${message}`);
  }
  return data;
}

export async function prepareImageBase64(uri: string): Promise<string> {
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1200 } }],
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );
  if (!manipulated.base64) throw new Error('Failed to encode image');
  return manipulated.base64;
}

export async function scanLabel(base64Image: string): Promise<WineDetails> {
  const data = await invokeFunction('scan-label', { base64Image }) as WineDetails;
  return data;
}

export async function getWineIntelligence(wine: WineDetailsComplete, currency: string = 'GBP'): Promise<WineIntelligence> {
  const data = await invokeFunction('wine-intelligence', {
    producer: wine.producer,
    region: wine.region,
    wineName: wine.wineName,
    vintage: wine.vintage,
    colour: wine.colour ?? null,
    currency,
  }) as WineIntelligence;
  return data;
}

export async function generatePairings(wine: WineDetailsComplete, filters: DietaryFilters): Promise<Pairing[]> {
  const data = await invokeFunction('generate-pairings', { wine, filters }) as { pairings: Pairing[] };
  return data.pairings;
}

export interface ImportedCellarWine {
  wine_name: string;
  producer: string;
  region: string;
  vintage: string | null;
  quantity: number;
  purchase_price?: number | null;
  currency?: string | null;
}

export async function importCellarDocument(base64Image: string): Promise<{ wines: ImportedCellarWine[] }> {
  return invokeFunction('import-cellar', { base64Image }) as Promise<{ wines: ImportedCellarWine[] }>;
}

export async function generatePersonality(category: 'wine' | 'recipe' | 'restaurant', payload: {
  preferences?: Record<string, unknown> | null;
  wines?: Array<{ producer: string | null; wine_name: string; vintage: string | null; region: string | null }>;
  restaurants?: Array<{ name: string | null; city: string | null; food: number | null; service: number | null; wineList: number | null; overall: number | null; note: string | null }>;
}): Promise<{ text: string }> {
  return invokeFunction('personality', { category, ...payload }) as Promise<{ text: string }>;
}

export async function findFoodWinePairing(
  dish: string,
  mode: 'cellar' | 'general',
  cellarWines?: { id: string; wine_name: string; producer: string | null; region: string | null; vintage: string | null; grape_variety: string | null; drinking_window_status: string }[],
  difficulty?: string,
  userPreferences?: Record<string, unknown> | null,
): Promise<unknown> {
  return invokeFunction('food-wine-pairing', { dish, mode, cellarWines, difficulty, userPreferences });
}
