import { invokeResilient } from './invokeResilient';
import type { CellarWine } from '../types/wine';
import { getCellarContext } from './cellarContext';

export type DiscoverIntent = 'cellar_mood' | 'consult' | 'intel' | 'my_data' | 'unclear';

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

// Answer a question about the user's OWN records (reviews + restaurant visits).
// Scoped server-side to the signed-in user. Returns a short natural answer.
// history: earlier turns of the same chat, so follow-up questions make sense.
export async function askMyData(question: string, history: { q: string; a: string }[] = []): Promise<string> {
  // The cellar currently selected in the Cellar tab (own or a shared one), so
  // answers about "my cellar" match what the user is looking at.
  const ctx = getCellarContext();
  const cellarOwnerId = ctx.ownerId ?? ctx.userId ?? undefined;
  const data = await invokeResilient('ask-my-data', { question, history, cellarOwnerId }) as { answer?: string | null; error?: string };
  if (data?.error && !data?.answer) throw new Error(data.error);
  return (data?.answer ?? '').trim() || "I couldn't find that in your records.";
}
