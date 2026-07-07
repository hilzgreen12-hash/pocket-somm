import * as ImageManipulator from 'expo-image-manipulator';
import { invokeResilient, isNetworkError } from './invokeResilient';
import { streamPairings } from './pairingsStream';
import type { WineDetails, WineIntelligence, Pairing, WineDetailsComplete, DietaryFilters } from '../types/wine';

// All edge calls go through invokeResilient, which attaches the user's JWT (via
// the supabase client), applies a per-call timeout, and retries transport
// failures — the long AI calls here are exactly the ones that drop on cellular.
async function invokeFunction(name: string, body: unknown): Promise<unknown> {
  return invokeResilient(name, body);
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

export async function getWineIntelligence(
  wine: WineDetailsComplete,
  currency: string = 'GBP',
  // Optional Wine-Searcher aggregated score. When supplied it anchors the
  // Vinster criticScore (the "north star" model) instead of a from-scratch estimate.
  wsScore?: number | null,
): Promise<WineIntelligence> {
  const data = await invokeFunction('wine-intelligence', {
    producer: wine.producer,
    region: wine.region,
    wineName: wine.wineName,
    vintage: wine.vintage,
    style: wine.style ?? null,
    currency,
    wsScore: wsScore ?? null,
  }) as WineIntelligence;
  return data;
}

export interface WineKnowledge {
  producerProfile: string;
  regionProfile: string;
  vintageProfile: string;
  grapeProfile: string;
}

// "Dive Deeper" — four editorial profiles for a wine (producer, region,
// vintage, grape). Generated once and cached on the cellar row by the caller.
export async function getWineKnowledge(input: {
  producer: string; region: string; wineName: string | null; vintage: string | null; grape: string | null;
}): Promise<WineKnowledge> {
  const data = await invokeFunction('wine-knowledge', {
    producer: input.producer,
    region: input.region,
    wineName: input.wineName,
    vintage: input.vintage,
    grape: input.grape,
  }) as WineKnowledge;
  return data;
}

export async function generatePairings(
  wine: WineDetailsComplete,
  filters: DietaryFilters,
  options?: { excludeChefs?: string[]; additionalRequest?: string | null },
): Promise<Pairing[]> {
  // Backwards-compatible: omitted keys are treated as defaults by the
  // edge function (no excludes, no steer).
  const body = {
    wine,
    filters,
    excludeChefs: options?.excludeChefs ?? [],
    additionalRequest: options?.additionalRequest ?? null,
  };

  // Prefer the streamed path: this ~65s generation is the one most likely to
  // drop on cellular, and a heartbeat-kept SSE connection survives where a
  // single idle request doesn't. If streaming drops (after its own retries) or
  // isn't supported on the device, fall back to the buffered invoke so pairings
  // still work — less cellular-robust, but better than a hard failure. A real
  // application error (not a transport drop) propagates without falling back.
  try {
    const data = await streamPairings(body) as { pairings: Pairing[] };
    return data.pairings;
  } catch (err) {
    if (!isNetworkError(err)) throw err;
    const data = await invokeResilient('generate-pairings', { ...body, stream: false }) as { pairings: Pairing[] };
    return data.pairings;
  }
}

export interface ImportedCellarWine {
  wine_name: string;
  producer: string;
  region: string;
  vintage: string | null;
  quantity: number;
  // Bottle format in millilitres (750 = standard). The edge function maps
  // magnum / half / Jeroboam etc. when the document indicates one.
  bottle_size_ml?: number | null;
  purchase_price?: number | null;
  currency?: string | null;
}

export async function importCellarDocument(base64Image: string): Promise<{ wines: ImportedCellarWine[] }> {
  return invokeFunction('import-cellar', { base64Image }) as Promise<{ wines: ImportedCellarWine[] }>;
}

// "Archive a Night" — identify each bottle in a lineup photo.
export interface DetectedBottle {
  producer: string;
  wineName: string;
  vintage: string | null;
  region?: string | null;
  confident: boolean;
  // How many identical bottles this entry represents after the lineup is
  // batched (same producer + name + vintage collapse into one row). Absent or
  // 1 = a single bottle. Seeds the cellar quantity when the bottle is onboarded.
  quantity?: number;
  // Bounding box of the bottle in the lineup photo, as fractions of the image
  // (0–1). Used to crop a per-bottle thumbnail when placing a lineup into a rack.
  box?: { x: number; y: number; w: number; h: number } | null;
  // Bottle format in millilitres (default 750). Editable per row in the rack
  // lineup review; seeds the cellar wine's bottle_size_ml on placement.
  bottleSizeMl?: number;
}
export async function detectLineup(base64Image: string): Promise<{ bottles: DetectedBottle[] }> {
  return invokeFunction('detect-lineup', { base64Image }) as Promise<{ bottles: DetectedBottle[] }>;
}

export async function generatePersonality(category: 'wine' | 'recipe' | 'restaurant', payload: {
  preferences?: Record<string, unknown> | null;
  wines?: Array<{ producer: string | null; wine_name: string; vintage: string | null; region: string | null }>;
  restaurants?: Array<{ name: string | null; city: string | null; food: number | null; service: number | null; wineList: number | null; overall: number | null; note: string | null }>;
  recipes?: Array<{ dishName: string; chefInspiration: string | null; pairingNotes: string | null; isFavourite: boolean }>;
}): Promise<{ text?: string; ready?: boolean }> {
  return invokeFunction('personality', { category, ...payload }) as Promise<{ text?: string; ready?: boolean }>;
}

export async function findFoodWinePairing(
  dish: string,
  mode: 'cellar' | 'general',
  cellarWines?: { id: string; wine_name: string; producer: string | null; region: string | null; vintage: string | null; grape_variety: string | null; drinking_window_status: string; purchase_price: number | null; purchase_price_currency: string | null }[],
  difficulty?: string,
  userPreferences?: Record<string, unknown> | null,
  stylePreference?: string | null,
  budget?: number | null,
): Promise<unknown> {
  return invokeFunction('food-wine-pairing', { dish, mode, cellarWines, difficulty, userPreferences, stylePreference, budget });
}
