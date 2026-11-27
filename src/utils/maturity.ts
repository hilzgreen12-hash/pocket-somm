// Shared maturity (drinking-window) derivation.
//
// The cellar list and the racks/fridges filter wines by maturity. Historically
// they read the stored `drinking_window_status` column, which had two problems:
//   1. it was only ever set when a wine's intel was generated (so freshly-added
//      or imported wines sat at 'unknown' and the filter silently dropped them);
//   2. it was a snapshot taken at generation time, so it went stale as the years
//      passed (a wine 'too_young' in 2024 is still labelled 'too_young' in 2028).
//
// Deriving the status from the stored window bounds (drinking_window_from/to)
// against the current year fixes (2): any wine with a window is always classed
// correctly, today. We still need the window itself populated at entry to fix
// (1) — that's done where wines are added.
//
// Status vocabulary matches MATURITY_OPTIONS and the rack colour-coding:
//   'too_young' | 'approaching' | 'peak' | 'declining' | 'unknown'

type MaturityStatus = 'too_young' | 'approaching' | 'peak' | 'declining' | 'unknown';

// How many years before a window opens we start calling a wine 'approaching'.
const APPROACHING_YEARS = 2;

export function deriveMaturityStatus(
  from: number | null | undefined,
  to: number | null | undefined,
  nowYear: number = new Date().getFullYear(),
): MaturityStatus {
  const hasFrom = typeof from === 'number' && Number.isFinite(from);
  const hasTo = typeof to === 'number' && Number.isFinite(to);
  if (!hasFrom && !hasTo) return 'unknown';

  // Past the close of the window → declining.
  if (hasTo && nowYear > (to as number)) return 'declining';

  // Before the window opens → too young, or approaching if within a couple of years.
  if (hasFrom && nowYear < (from as number)) {
    return (from as number) - nowYear <= APPROACHING_YEARS ? 'approaching' : 'too_young';
  }

  // Within the window (or only one bound known and we're on the right side of it).
  return 'peak';
}

// Resolve a wine's effective maturity: derive from the window bounds when we
// have them (always current), else fall back to whatever status was stored.
export function effectiveMaturity(wine: {
  drinking_window_from: number | null;
  drinking_window_to: number | null;
  drinking_window_status?: string | null;
  is_spirit?: boolean | null;
}): string {
  // Spirits don't mature in the bottle — return a sentinel that matches none of
  // the real maturity statuses, so a spirit never gets a maturity tag/colour and
  // is never surfaced as "peak now" or caught by a maturity filter.
  if (wine.is_spirit) return 'spirit';
  if (wine.drinking_window_from != null || wine.drinking_window_to != null) {
    return deriveMaturityStatus(wine.drinking_window_from, wine.drinking_window_to);
  }
  return wine.drinking_window_status ?? 'unknown';
}

// ---- Drinking stages (what the person sees) ---------------------------------
//
// Where today falls inside the wine's drinking window, in seven stages, the
// same everywhere a window is shown (intel cards, cellar and archive cards,
// Compare, statistics and every maturity filter). The window runs from the
// start of its first year to the end of its last, so 2025–2050 is 26 years and
// late 2026 is ~7% in — Approachable, not Sweet Spot.
//   before the first year → Too Young
//   0–20% Approachable · 20–40% Within Peak · 40–60% Sweet Spot
//   60–80% Getting On · 80–100% Drink Up
//   after the last year   → Declining

export type DrinkingStage =
  | 'too_young' | 'approachable' | 'within_peak' | 'sweet_spot' | 'getting_on' | 'drink_up' | 'declining' | 'unknown';

// Youngest → oldest, for filters and statistics.
export const DRINKING_STAGES: Exclude<DrinkingStage, 'unknown'>[] = [
  'too_young', 'approachable', 'within_peak', 'sweet_spot', 'getting_on', 'drink_up', 'declining',
];

export const STAGE_LABEL: Record<DrinkingStage, string> = {
  too_young: 'Too Young',
  approachable: 'Approachable',
  within_peak: 'Within Peak',
  sweet_spot: 'Sweet Spot',
  getting_on: 'Getting On',
  drink_up: 'Drink Up',
  declining: 'Declining',
  unknown: 'Unknown',
};

// Today as a fractional year (2026.9 is late 2026).
function yearNow(now: Date): number {
  const start = new Date(now.getFullYear(), 0, 1).getTime();
  const end = new Date(now.getFullYear() + 1, 0, 1).getTime();
  return now.getFullYear() + (now.getTime() - start) / (end - start);
}

// The stage for a window. With only one end known, the stage can only be
// placed where it's certain: before the start (Too Young) or after the end
// (Declining); otherwise Unknown rather than a guess.
export function drinkingStage(
  from: number | null | undefined,
  to: number | null | undefined,
  now: Date = new Date(),
): DrinkingStage {
  const hasFrom = typeof from === 'number' && Number.isFinite(from);
  const hasTo = typeof to === 'number' && Number.isFinite(to);
  const t = yearNow(now);
  if (hasTo && t >= (to as number) + 1) return 'declining';
  if (hasFrom && t < (from as number)) return 'too_young';
  if (!hasFrom || !hasTo) return 'unknown';
  const start = from as number;
  const span = Math.max(1, (to as number) + 1 - start);
  const p = (t - start) / span;
  if (p < 0.2) return 'approachable';
  if (p < 0.4) return 'within_peak';
  if (p < 0.6) return 'sweet_spot';
  if (p < 0.8) return 'getting_on';
  return 'drink_up';
}

// From years when there are any; else a stage from an older stored status,
// kept only where it's certain (a wine before or after its window).
export function stageFrom(
  from: number | null | undefined,
  to: number | null | undefined,
  storedStatus?: string | null,
  now: Date = new Date(),
): DrinkingStage {
  if (from != null || to != null) return drinkingStage(from, to, now);
  // Legacy stored statuses: 'approaching' was written for wines just becoming
  // drinkable, 'peak' for wines inside their window.
  if (storedStatus === 'approaching') return 'approachable';
  if (storedStatus === 'peak') return 'within_peak';
  if (storedStatus === 'too_young') return 'too_young';
  if (storedStatus === 'declining') return 'declining';
  if (storedStatus && (DRINKING_STAGES as string[]).includes(storedStatus)) return storedStatus as DrinkingStage;
  return 'unknown';
}

// A cellar wine's stage ('spirit' for spirits, which don't mature in bottle).
export function wineDrinkingStage(wine: {
  drinking_window_from: number | null;
  drinking_window_to: number | null;
  drinking_window_status?: string | null;
  is_spirit?: boolean | null;
}): DrinkingStage | 'spirit' {
  if (wine.is_spirit) return 'spirit';
  return stageFrom(wine.drinking_window_from, wine.drinking_window_to, wine.drinking_window_status);
}

// Filter / statistics options, youngest → oldest.
export const DRINKING_STAGE_OPTIONS: { value: string; label: string }[] =
  DRINKING_STAGES.map((s) => ({ value: s, label: STAGE_LABEL[s] }));

// Words someone might type in a rack / cellar search for a stage. "Drinking
// now" and the like mean anywhere inside the window.
const IN_WINDOW: DrinkingStage[] = ['approachable', 'within_peak', 'sweet_spot', 'getting_on', 'drink_up'];
export const STAGE_SEARCH_TERMS: { term: string; stages: DrinkingStage[] }[] = [
  ...['too young', 'young', 'hold'].map((term) => ({ term, stages: ['too_young'] as DrinkingStage[] })),
  ...['approachable', 'approaching', 'approach', 'early'].map((term) => ({ term, stages: ['approachable'] as DrinkingStage[] })),
  ...['within peak', 'peak'].map((term) => ({ term, stages: ['within_peak'] as DrinkingStage[] })),
  { term: 'sweet spot', stages: ['sweet_spot'] as DrinkingStage[] },
  { term: 'getting on', stages: ['getting_on'] as DrinkingStage[] },
  ...['drink up', 'drink soon'].map((term) => ({ term, stages: ['drink_up'] as DrinkingStage[] })),
  ...['declining', 'decline', 'fading', 'past peak'].map((term) => ({ term, stages: ['declining'] as DrinkingStage[] })),
  ...['drinking now', 'drink now', 'ready', 'drinking'].map((term) => ({ term, stages: IN_WINDOW })),
].sort((a, b) => b.term.length - a.term.length); // longest first: "past peak" before "peak"
