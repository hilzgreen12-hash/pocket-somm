import { invokeResilient } from './invokeResilient';

export type PairIntent = 'cellar_pairing' | 'dish_suggestion' | 'cookbook_search' | 'unclear';

export interface PairVoiceResult {
  intent: PairIntent;
  // cellar_pairing
  dish?: string;
  count?: number | null;
  // dish_suggestion
  wine?: {
    producer: string | null;
    wineName: string | null;
    region: string | null;
    vintage: string | null;
    grape: string | null;
    style: string | null;
  };
  // cookbook_search
  dishQuery?: string | null;
  wineQuery?: string | null;
  // unclear
  message?: string;
}

// Classify a spoken Pair-tab request into one of three pairing intents
// (server-side, LLM-classified, confidence-gated) and return that intent's
// payload. Cellar wines + saved recipes are resolved client-side by the caller.
export async function classifyPairVoice(transcript: string): Promise<PairVoiceResult> {
  const data = await invokeResilient('pair-voice', { transcript }) as PairVoiceResult;
  return data;
}
