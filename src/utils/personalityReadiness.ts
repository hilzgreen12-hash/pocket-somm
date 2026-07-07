// Single source of truth for "has this user earned a personality sketch yet?".
// Used by BOTH the home nudge (usePersonalityPrompt) and the personality screen,
// so the bar is defined once and can't drift between them.
//
// A sketch should feel earned, not conjured on a fresh install. So readiness
// needs three things, not just a raw count:
//   • VOLUME  — enough real items to read from
//   • VARIETY — weight genuine signals (reviews, saved recipes) over cheap ones
//               (bare pairing searches you can spam in a minute)
//   • TIME    — activity spread across at least a couple of distinct days, so a
//               single first-session burst doesn't trip it

export const PERSONALITY_GATE = {
  wineMinWines: 8,          // distinct cellar wines
  wineMinListPicks: 4,      // distinct List-scan sessions where a bottle was picked
  foodieMinSignals: 5,      // total food-side signals
  foodieMinHardSignals: 2,  // of those, this many must be "hard" (a review or saved recipe — not a bare search)
  minDistinctDays: 2,       // activity must span at least this many calendar days
} as const;

function dayKey(iso?: string | null): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : new Date(t).toISOString().slice(0, 10);
}

function distinctDays(isos: Array<string | null | undefined>): number {
  const days = new Set<string>();
  for (const iso of isos) { const k = dayKey(iso); if (k) days.add(k); }
  return days.size;
}

export interface PersonalityReadinessInput {
  wines: Array<{ created_at?: string | null }>;
  chosenWines: Array<{ source?: string | null; scan_session_id?: string | null; chosen_at?: string | null }>;
  archive: Array<{ restaurantName?: string | null; ratingOverall?: number | null; ratingFood?: number | null; restaurantNote?: string | null; capturedAt?: string | null }>;
  chefLabelSessions: Array<{ saved_at?: string | null }>;
  chefPairingSessions: Array<{ saved_at?: string | null }>;
}

export function evaluatePersonalityReadiness(input: PersonalityReadinessInput): { wineReady: boolean; foodieReady: boolean } {
  const g = PERSONALITY_GATE;

  // --- Wine ---
  const distinctCellarWines = input.wines.length;
  const listSessions = new Set(
    input.chosenWines.filter((cw) => cw.source !== 'other' && cw.scan_session_id).map((cw) => cw.scan_session_id),
  ).size;
  const wineVolume = distinctCellarWines >= g.wineMinWines || listSessions >= g.wineMinListPicks;
  const wineDays = distinctDays([
    ...input.wines.map((w) => w.created_at),
    ...input.chosenWines.filter((cw) => cw.source !== 'other').map((cw) => cw.chosen_at),
  ]);
  const wineReady = wineVolume && wineDays >= g.minDistinctDays;

  // --- Foodie ---
  const restaurantSignals = input.archive.filter((a) =>
    (a.restaurantName && a.restaurantName.trim()) || a.ratingOverall != null || a.ratingFood != null || (a.restaurantNote && a.restaurantNote.trim()),
  );
  // Hard = a real restaurant review or a saved (label→recipe) session.
  // Soft = a bare "find me a wine" pairing search.
  const hardSignals = restaurantSignals.length + input.chefLabelSessions.length;
  const softSignals = input.chefPairingSessions.length;
  const totalSignals = hardSignals + softSignals;
  const foodieDays = distinctDays([
    ...restaurantSignals.map((a) => a.capturedAt),
    ...input.chefLabelSessions.map((s) => s.saved_at),
    ...input.chefPairingSessions.map((s) => s.saved_at),
  ]);
  const foodieReady =
    totalSignals >= g.foodieMinSignals &&
    hardSignals >= g.foodieMinHardSignals &&
    foodieDays >= g.minDistinctDays;

  return { wineReady, foodieReady };
}
