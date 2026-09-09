import { invokeResilient } from './invokeResilient';
import type { CellarWine } from '../types/wine';

// One of Vinster's three mood picks — the cellar wine id, a short evocative
// rank label, and a justification tying the wine to the user's stated mood.
export interface MoodPick {
  id: string;
  rank: string;
  why: string;
}

// Trimmed cellar context for the picker — identity + the stored intel that
// helps it reason (score / drinking readiness). No images or notes.
function toWinePayload(w: CellarWine) {
  return {
    id: w.id,
    producer: w.producer,
    wineName: w.wine_name,
    vintage: w.vintage,
    region: w.region,
    style: w.style,
    criticScore: w.critic_score,
    drinkingWindowStatus: w.drinking_window_status,
  };
}

// Ask Vinster to choose three bottles from the user's OWN cellar that suit a
// spoken mood. Returns [] when nothing fits or the call fails.
export async function recommendFromCellar(transcript: string, wines: CellarWine[]): Promise<MoodPick[]> {
  const data = await invokeResilient('cellar-recommend', {
    transcript,
    wines: wines.map(toWinePayload),
  }) as { picks?: MoodPick[] };
  return Array.isArray(data.picks) ? data.picks.filter((p) => p && typeof p.id === 'string') : [];
}
