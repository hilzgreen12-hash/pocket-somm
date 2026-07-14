import { generateWineIntel } from './pricing';
import { updateCellarWine } from '../api/cellar';
import type { CellarWine } from '../types/wine';

const CONCURRENCY = 3;

// A cellar wine is "missing intel" when Vinster has never valued it — the
// valuation stamp (estimated_value_at) is only written once intel has run, so
// its absence is the reliable "never downloaded" signal.
export function isMissingIntel(w: CellarWine): boolean {
  return !w.estimated_value_at;
}

// Bulk-refresh critic score + market value (pricing) for a set of cellar wines.
// Saves ONLY the score + valuation fields — no Vinster review/rationale/drinking
// window is written, so this is the lightweight "just the numbers" update.
// Concurrency-bounded; a failure on one wine is skipped so partial progress
// survives. onProgress(done, total) fires as each wine completes.
export async function updateCellarIntelBatch(
  wines: CellarWine[],
  currency: string,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  let done = 0;
  onProgress?.(0, wines.length);
  let cursor = 0;
  async function worker() {
    while (cursor < wines.length) {
      const w = wines[cursor++];
      try {
        const intel = await generateWineIntel({
          producer: w.producer ?? '',
          region: w.region ?? '',
          wineName: w.wine_name || null,
          vintage: w.vintage || 'NV',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any, currency);
        await updateCellarWine(w.id, {
          estimated_value: intel.estimatedValue,
          estimated_value_currency: currency,
          estimated_value_at: new Date().toISOString(),
          estimated_value_source: intel.valueSource ?? 'vinster',
          critic_score: intel.criticScore,
          critic_score_note: intel.criticScoreNote ?? null,
        });
      } catch {
        // Skip on error — partial progress beats failing the whole batch.
      } finally {
        done += 1;
        onProgress?.(done, wines.length);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, wines.length) }, () => worker()));
}
