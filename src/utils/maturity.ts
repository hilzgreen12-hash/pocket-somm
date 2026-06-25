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

export type MaturityStatus = 'too_young' | 'approaching' | 'peak' | 'declining' | 'unknown';

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
}): string {
  if (wine.drinking_window_from != null || wine.drinking_window_to != null) {
    return deriveMaturityStatus(wine.drinking_window_from, wine.drinking_window_to);
  }
  return wine.drinking_window_status ?? 'unknown';
}
