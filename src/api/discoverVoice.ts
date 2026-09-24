import { invokeResilient } from './invokeResilient';
import type { CellarWine } from '../types/wine';

export type DiscoverIntent = 'cellar_mood' | 'consult' | 'intel' | 'unclear';

export interface DiscoverVoiceResult {
  intent: DiscoverIntent;
  // cellar_mood
  picks?: { id: string; rank: string; why: string }[];
  // consult
  question?: string;
  advice?: string;
  // intel
  wine?: {
    producer: string;
    wineName: string | null;
    region: string | null;
    vintage: string | null;
    style: string | null;
    grape: string | null;
  };
  // unclear
  message?: string;
}

// Classify a spoken Discover-tab request into one of three discovery intents
// (server-side, LLM-classified, confidence-gated) and return that intent's
// payload. The cellar list is sent so a "cellar_mood" pick can reference real ids.
export async function classifyDiscoverVoice(transcript: string, wines: CellarWine[]): Promise<DiscoverVoiceResult> {
  const data = await invokeResilient('discover-voice', {
    transcript,
    wines: wines.map((w) => ({
      id: w.id,
      producer: w.producer,
      wineName: w.wine_name,
      vintage: w.vintage,
      region: w.region,
      style: w.style,
    })),
  }) as DiscoverVoiceResult;
  return data;
}
