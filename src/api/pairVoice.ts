import { invokeResilient } from './invokeResilient';
import type { CellarWine } from '../types/wine';

export type PairIntent = 'cellar_pairing' | 'dish_suggestion' | 'cookbook_search' | 'unclear';

export interface PairVoiceResult {
  intent: PairIntent;
  // cellar_pairing + dish_suggestion — a broad, quick answer for the consult screen
  question?: string;
  advice?: string;
  // cookbook_search
  dishQuery?: string | null;
  wineQuery?: string | null;
  // unclear
  message?: string;
}

// Classify a spoken Pair-tab request into one of three pairing intents and, for
// the two live intents, return a BROAD quick answer (server-side, LLM, confidence-
// gated). The cellar is sent so a wine-pairing answer can name the user's bottles.
export async function classifyPairVoice(transcript: string, wines: CellarWine[]): Promise<PairVoiceResult> {
  const data = await invokeResilient('pair-voice', {
    transcript,
    wines: wines.map((w) => ({
      producer: w.producer,
      wineName: w.wine_name,
      vintage: w.vintage,
      region: w.region,
      style: w.style,
    })),
  }) as PairVoiceResult;
  return data;
}
