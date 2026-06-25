import { getWineIntelligence } from '../api/label';
import { updateCellarWine } from '../api/cellar';
import type { CellarWine } from '../types/wine';

// One-time, gentle backfill of drinking-window data for EXISTING cellar wines
// that predate entry-time maturity generation (see useCellar.ensureDrinkingWindow).
// Without this the maturity filter stays blank for wines added before the fix
// and never opened. It runs sequentially with a pause between calls so it never
// bursts the AI endpoint, processes each wine at most once per app session, and
// is capped so an unusually large cellar can't fire an unbounded number of
// calls unattended (the rest get picked up on the next visit, or when opened).

const SESSION_CAP = 60;       // max wines to backfill per app session
const PACE_MS = 1500;         // pause between calls — gentle, never a burst

let running = false;
const processed = new Set<string>();

function needsWindow(w: CellarWine): boolean {
  return (
    !w.is_wishlist &&
    w.archived_at == null &&
    w.drinking_window_from == null &&
    w.drinking_window_to == null &&
    (w.drinking_window_status == null || w.drinking_window_status === 'unknown') &&
    !processed.has(w.id)
  );
}

export async function backfillMissingMaturities(
  wines: CellarWine[],
  onComplete?: () => void,
): Promise<void> {
  if (running) return;
  const targets = wines.filter(needsWindow).slice(0, SESSION_CAP);
  if (targets.length === 0) return;
  if (wines.filter(needsWindow).length > SESSION_CAP) {
    console.warn(`[maturity] ${wines.filter(needsWindow).length} wines need a maturity; backfilling ${SESSION_CAP} this session, the rest next time.`);
  }

  running = true;
  let updated = 0;
  try {
    for (const w of targets) {
      processed.add(w.id);
      try {
        const intel = await getWineIntelligence({
          producer: w.producer ?? '',
          region: w.region ?? '',
          wineName: w.wine_name ?? null,
          vintage: w.vintage ?? 'NV',
          style: null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
        await updateCellarWine(w.id, {
          drinking_window_from: intel.drinkingWindowFrom ?? null,
          drinking_window_to: intel.drinkingWindowTo ?? null,
          drinking_window_status: intel.drinkingWindowStatus ?? 'unknown',
        });
        updated++;
      } catch {
        /* skip this wine, carry on with the rest */
      }
      await new Promise((r) => setTimeout(r, PACE_MS));
    }
  } finally {
    running = false;
    // Refresh once at the end rather than per-wine, so a big backfill doesn't
    // trigger dozens of cellar refetches.
    if (updated > 0) onComplete?.();
  }
}
