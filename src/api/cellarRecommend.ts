import { invokeResilient } from './invokeResilient';
import type { CellarWine } from '../types/wine';
import { effectiveMaturity } from '../utils/maturity';

// One of Vinster's three mood picks — the cellar wine id, a short evocative
// rank label, and a justification tying the wine to the user's stated mood.
interface MoodPick {
  id: string;
  rank: string;
  why: string;
}

// Trimmed cellar context for the picker — identity + the stored intel that
// helps it reason (score / drinking readiness, worked out from the window today
// rather than the status stored when the intel was generated). No images or notes.
function toWinePayload(w: CellarWine) {
  return {
    id: w.id,
    producer: w.producer,
    wineName: w.wine_name,
    vintage: w.vintage,
    region: w.region,
    style: w.style,
    criticScore: w.critic_score,
    drinkingWindowStatus: effectiveMaturity(w),
  };
}

// Ask Vinster to choose three bottles that suit a spoken mood from `wines` — a
// pre-filtered shortlist of the user's OWN cellar, never the whole of a large
// one. Returns [] when nothing fits; a failed call throws.
export async function recommendFromCellar(transcript: string, wines: CellarWine[]): Promise<MoodPick[]> {
  const data = await invokeResilient('cellar-recommend', {
    transcript,
    wines: wines.map(toWinePayload),
  }) as { picks?: MoodPick[] };
  return Array.isArray(data.picks) ? data.picks.filter((p) => p && typeof p.id === 'string') : [];
}
