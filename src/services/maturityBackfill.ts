import AsyncStorage from '@react-native-async-storage/async-storage';
import { getWineIntelligence } from '../api/label';
import { updateCellarWine } from '../api/cellar';
import { canEditCellar } from '../api/cellarContext';
import type { CellarWine } from '../types/wine';

// Background drinking-window fill for cellar wines that have none, so the
// maturity filter doesn't silently drop them. Gentle by design: sequential with
// a pause between calls, capped per session, and each wine is tried at most once
// per user, remembered across sessions, whatever the answer.
//
// Imported wines are left alone: an import stays on-demand (intel only when a
// wine is opened). So are wines held only in External Storage; the caller
// leaves those out, as it has the placements. View-only members never run it:
// the owner's rows would refuse the write after the intel was paid for.

const SESSION_CAP = 60;       // max wines to try per app session
const PACE_MS = 1500;         // pause between calls — gentle, never a burst

let running = false;
const triedThisSession = new Set<string>();   // includes failed calls, so they wait for the next session

const triedKey = (userId: string) => `maturity-backfill-tried-v2:${userId}`;
// v1 kept only the wines Vinster didn't recognise, for all users together.
const LEGACY_KEY = 'maturity-backfill-unrecognised-v1';

async function loadTried(userId: string): Promise<Set<string>> {
  try {
    const [current, legacy] = await Promise.all([AsyncStorage.getItem(triedKey(userId)), AsyncStorage.getItem(LEGACY_KEY)]);
    return new Set<string>([...JSON.parse(current ?? '[]'), ...JSON.parse(legacy ?? '[]')]);
  } catch {
    return new Set();
  }
}
async function saveTried(userId: string, ids: Set<string>): Promise<void> {
  try {
    await AsyncStorage.setItem(triedKey(userId), JSON.stringify(Array.from(ids).slice(-5000)));
    await AsyncStorage.removeItem(LEGACY_KEY);
  } catch { /* best-effort */ }
}

// Imported wines carry added_via = 'import' (migration 136, which also marked
// earlier imports).
function isImported(w: CellarWine): boolean {
  return w.added_via === 'import';
}

function needsWindow(w: CellarWine): boolean {
  return (
    w.archived_at == null &&
    !isImported(w) &&
    w.drinking_window_from == null &&
    w.drinking_window_to == null &&
    (w.drinking_window_status == null || w.drinking_window_status === 'unknown')
  );
}

export async function backfillMissingMaturities(
  userId: string,
  wines: CellarWine[],
  onComplete?: () => void,
): Promise<void> {
  if (running || !canEditCellar()) return;
  running = true;
  let updated = 0;
  try {
    const tried = await loadTried(userId);
    const targets = wines
      .filter((w) => needsWindow(w) && !tried.has(w.id) && !triedThisSession.has(w.id))
      .slice(0, Math.max(0, SESSION_CAP - triedThisSession.size));
    for (const w of targets) {
      triedThisSession.add(w.id);
      try {
        const intel = await getWineIntelligence({
          producer: w.producer ?? '',
          region: w.region ?? '',
          wineName: w.wine_name ?? null,
          vintage: w.vintage ?? 'NV',
          style: null,
        });
        tried.add(w.id);
        await saveTried(userId, tried);
        // A wine Vinster doesn't recognise never gets a guessed window.
        if (intel.identified === false) continue;
        await updateCellarWine(w.id, {
          drinking_window_from: intel.drinkingWindowFrom ?? null,
          drinking_window_to: intel.drinkingWindowTo ?? null,
          drinking_window_status: intel.drinkingWindowStatus ?? 'unknown',
        });
        updated++;
      } catch {
        /* a failed call isn't remembered, so the wine is tried again next session */
      }
      await new Promise((r) => setTimeout(r, PACE_MS));
    }
  } finally {
    running = false;
    // One refresh at the end rather than per wine.
    if (updated > 0) onComplete?.();
  }
}
