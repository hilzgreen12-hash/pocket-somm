import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateWineIntel, isWineNotFound } from './pricing';
import { searchLabelImages } from '../api/label';
import { uploadLabelImageFromUrl } from '../api/labelPhotos';
import { updateCellarWine } from '../api/cellar';
import { canEditCellar } from '../api/cellarContext';
import type { CellarWine, WineIntelligence } from '../types/wine';

// The one bulk "critic score + market value" update, used by Cellar Statistics
// (Calculate / Recalculate / Auto Update All / Refresh in another currency) and
// by Your Cellar List's "Update all". Every lookup is paid, so the callers'
// rules are enforced here as well as in their screens:
//   • view-only members never run it (the owner's rows would refuse the write
//     after the lookup was paid for);
//   • imported wines are never in a bulk run — an import stays on demand, valued
//     when the wine is opened;
//   • wines a run couldn't value are remembered and left out of later runs for
//     a while, so "Update all" doesn't pay for the same wines on every press.

export const BULK_BATCH_SIZE = 25;
const CONCURRENCY = 3;
const DAY_MS = 24 * 60 * 60 * 1000;
// A value older than this is due a refresh (Recalculate). Matches how often the
// wine card looks a wine up by itself.
const VALUE_STALE_MS = 30 * DAY_MS;
// How long a wine a run couldn't value sits out of further bulk runs.
const RETRY_AFTER_MS = 30 * DAY_MS;

// Values a bulk estimate never replaces: a real Wine-Searcher price, the user's
// own figure, and the price an import carried. Only a new Wine-Searcher price
// may replace them — the same rule as the wine card.
const PROTECTED_SOURCES = new Set(['wine-searcher', 'user', 'imported']);

export function isImported(w: CellarWine): boolean {
  return w.added_via === 'import';
}

// A cellar wine is "missing intel" when it has never been valued OR carries no
// critic score (some wines were valued without a score landing), so the Full
// Cellar List's "Update all" fills both in.
export function isMissingIntel(w: CellarWine): boolean {
  return !w.estimated_value_at || w.critic_score == null;
}

export function isValueStale(w: CellarWine, now: number = Date.now()): boolean {
  return !!w.estimated_value_at && now - new Date(w.estimated_value_at).getTime() > VALUE_STALE_MS;
}

// ---- Wines a run couldn't value, remembered per user on this device ----

const triedKey = (userId: string) => `bulk-intel-tried-v1:${userId}`;

// wine id → when a run last failed to value it, for the wines still sitting out.
export async function loadTriedWines(userId: string): Promise<Map<string, number>> {
  try {
    const stored = JSON.parse((await AsyncStorage.getItem(triedKey(userId))) ?? '{}') as Record<string, number>;
    const cutoff = Date.now() - RETRY_AFTER_MS;
    return new Map(Object.entries(stored).filter(([, at]) => at > cutoff));
  } catch {
    return new Map();
  }
}

async function rememberTried(userId: string, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  try {
    const tried = await loadTriedWines(userId);
    const now = Date.now();
    for (const id of ids) tried.set(id, now);
    await AsyncStorage.setItem(triedKey(userId), JSON.stringify(Object.fromEntries(tried)));
  } catch { /* best-effort: at worst the wine is offered again */ }
}

// Whether a wine may be in a bulk run at all.
export function isBulkEligible(w: CellarWine, tried: Map<string, number>): boolean {
  return !w.archived_at && !isImported(w) && !tried.has(w.id);
}

// ---- The write for one wine ----

// A lookup's value and critic score — the part of the result both the wine
// card (valueWine) and bulk runs (generateWineIntel) write.
export type ValueLookup = {
  estimatedValue: number | null;
  estimatedValueLow?: number | null;
  estimatedValueHigh?: number | null;
  priceScope?: 'vintage' | 'all-vintage' | null;
  valueSource?: 'wine-searcher' | 'vinster' | null;
  currency: string;
  wsUnavailable?: boolean;
  criticScore: number | null;
  criticScoreNote?: string | null;
};

// The one keep rule for a stored value and critic score, shared by the wine
// card (useWineIntel) and bulk runs so they can't drift: an existing value is
// never replaced by nothing, nor by a stand-in made while Wine-Searcher couldn't
// be asked, and a protected value is only replaced by a new Wine-Searcher price.
// The range and scope are written with the value, so the card never shows an
// old range beside a new value. An existing critic score is kept when the
// lookup has none, or when the value beside it was kept.
export function valueAndScorePatch(w: CellarWine, lookup: ValueLookup): { keepValue: boolean; patch: Partial<CellarWine> } {
  const newSource = lookup.valueSource ?? 'vinster';
  const keepValue = w.estimated_value != null && (
    lookup.estimatedValue == null
    || !!lookup.wsUnavailable
    || (PROTECTED_SOURCES.has(w.estimated_value_source ?? '') && newSource !== 'wine-searcher')
  );
  const now = new Date().toISOString();
  const value: Partial<CellarWine> = keepValue ? {}
    : lookup.estimatedValue == null
      // Nothing to show: stamp the attempt, so Statistics lists the wine as one
      // Vinster couldn't value (for the user to fill in) rather than not yet tried.
      ? { estimated_value_at: now }
      : {
        estimated_value: lookup.estimatedValue,
        estimated_value_currency: lookup.currency,
        estimated_value_at: now,
        estimated_value_source: newSource,
        estimated_value_low: lookup.estimatedValueLow ?? null,
        estimated_value_high: lookup.estimatedValueHigh ?? null,
        estimated_value_scope: lookup.priceScope ?? null,
      };

  const keepScore = w.critic_score != null && (lookup.criticScore == null || keepValue);
  const score: Partial<CellarWine> = keepScore ? {}
    : { critic_score: lookup.criticScore, critic_score_note: lookup.criticScoreNote ?? null };
  return { keepValue, patch: { ...value, ...score } };
}

// What a bulk lookup changes on the wine: the shared value/score keep rule,
// plus a blank region / grape filled in.
function intelPatch(w: CellarWine, intel: WineIntelligence, currency: string): Partial<CellarWine> {
  const { patch } = valueAndScorePatch(w, { ...intel, currency });

  // Fill a blank region / grape, so region-less wines can be classified in
  // Cellar Statistics. Never overwrites what the user or an import supplied.
  const classify: Partial<CellarWine> = {};
  if (!w.region?.trim() && intel.region?.trim()) classify.region = intel.region.trim();
  if (!w.grape_variety?.trim() && intel.grapeVariety?.trim()) classify.grape_variety = intel.grapeVariety.trim();

  return {
    ...patch,
    ...(intel.wsWineId ? { ws_wine_id: intel.wsWineId, ws_wine_name: intel.wsWineName ?? null } : {}),
    ...classify,
  };
}

// A web label photo for a photo-less wine (best-effort). Uploaded to the label
// bucket and saved as a storage path, which is what the thumbnails load.
async function findLabelPhoto(w: CellarWine): Promise<Partial<CellarWine>> {
  if (w.label_image_path || !w.user_id) return {};
  try {
    const [found] = await searchLabelImages({ producer: w.producer, wineName: w.wine_name });
    if (!found) return {};
    return { label_image_path: await uploadLabelImageFromUrl(w.user_id, found.url, w.id) };
  } catch {
    return {};
  }
}

type Outcome = 'updated' | 'not-valued' | 'failed';

async function updateOne(w: CellarWine, currency: string, findLabels: boolean): Promise<Outcome> {
  let intel: WineIntelligence | null;
  try {
    intel = await generateWineIntel({
      producer: w.producer ?? '',
      region: w.region ?? '',
      wineName: w.wine_name || null,
      vintage: w.vintage || 'NV',
      style: w.style ?? null,
      grape: w.grape_variety ?? null,
    }, currency);
  } catch (e) {
    if (!isWineNotFound(e)) return 'failed';
    intel = null;
  }
  // Not found, or found only as a different wine than the one in the cellar
  // (resolvedIdentity): nothing is saved from it — Vinster never puts another
  // wine's intel on the user's bottle. A wine with no value is stamped as tried.
  if (!intel || intel.resolvedIdentity) {
    if (w.estimated_value == null) await updateCellarWine(w.id, { estimated_value_at: new Date().toISOString() });
    return 'not-valued';
  }
  const patch = { ...intelPatch(w, intel, currency), ...(findLabels ? await findLabelPhoto(w) : {}) };
  await updateCellarWine(w.id, patch);
  // A Wine-Searcher outage isn't the wine's fault — it can be tried again soon.
  if (intel.wsUnavailable) return 'updated';
  // No new value (none found, or the stored one was kept) or still no score:
  // another run soon would pay for the same answer.
  const newValue = patch.estimated_value != null;
  return !newValue || (patch.critic_score ?? w.critic_score) == null ? 'not-valued' : 'updated';
}

// Look up and save critic score + market value for `wines` (callers pass one
// bunch of at most BULK_BATCH_SIZE). Concurrency-bounded; a failure on one wine
// is skipped so the rest still save. Aborting stops further wines starting —
// each finished wine is already saved. onProgress(done, total) fires per wine.
export async function updateCellarIntelBatch(
  wines: CellarWine[],
  opts: {
    userId: string;
    currency: string;
    // Also find a label photo for photo-less wines (Your Cellar List's run).
    findLabels?: boolean;
    onProgress?: (done: number, total: number) => void;
    signal?: AbortSignal;
  },
): Promise<void> {
  if (!canEditCellar()) return;
  const todo = wines.filter((w) => !isImported(w));
  const notValued: string[] = [];
  let done = 0;
  let cursor = 0;
  opts.onProgress?.(0, todo.length);
  async function worker() {
    while (cursor < todo.length && !opts.signal?.aborted) {
      const w = todo[cursor++];
      try {
        if (await updateOne(w, opts.currency, !!opts.findLabels) === 'not-valued') notValued.push(w.id);
      } catch {
        // The write failed — skip; partial progress beats failing the lot.
      } finally {
        done += 1;
        opts.onProgress?.(done, todo.length);
      }
    }
  }
  try {
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, todo.length) }, () => worker()));
  } finally {
    await rememberTried(opts.userId, notValued);
  }
}
