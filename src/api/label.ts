import * as ImageManipulator from 'expo-image-manipulator';
import type { WineDetails, WineIntelligence, Pairing, WineDetailsComplete, DietaryFilters } from '../types/wine';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

async function invokeFunction(name: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${name} error ${res.status}: ${text}`);
  return JSON.parse(text);
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

export async function findFoodWinePairing(
  dish: string,
  mode: 'cellar' | 'general',
  cellarWines?: { id: string; wine_name: string; producer: string | null; region: string | null; vintage: string | null; grape_variety: string | null; drinking_window_status: string }[],
  difficulty?: string,
  userPreferences?: Record<string, unknown> | null,
): Promise<unknown> {
  return invokeFunction('food-wine-pairing', { dish, mode, cellarWines, difficulty, userPreferences });
}
