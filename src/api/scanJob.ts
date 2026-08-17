import { supabase } from './supabase';
import { invokeResilient } from './invokeResilient';
import type { ExtractedWine } from '../types/wine';

// Client for the async wine-list scan. Instead of holding one ~90s connection
// open (OCR → recommend) — fragile on mobile, the old ~50% success rate — we:
//   1. startScanJob(): fire scan-start, get a jobId back in <1s.
//   2. pollScanJob(): read the scan_jobs row every few seconds until done/error.
// The server finishes the work in the background, so a dropped connection or a
// backgrounded app never loses it — the next poll just collects the result.

export interface ScanJobParams {
  scanPreferences: unknown; // ScanPreferences (wineTypes, budget, foodPairing, …)
  profile: unknown;         // profile filter fields (disliked/favourite, defaultBudget)
  currency: string;
}

export interface ScanJobResult {
  status: 'done' | 'error';
  wines: ExtractedWine[] | null;      // OCR-read list (for history/caching)
  // RAW recommend response — the caller runs finalizeRecommendation() on it to
  // inject menu prices etc. (same mapping as the inline path).
  recommendation: unknown;
  error: string | null;
}

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 180000; // 3 min hard ceiling — well past a normal scan

// Kick off the background job. Returns the jobId immediately (sub-second).
export async function startScanJob(images: string[], params: ScanJobParams): Promise<string> {
  const data = await invokeResilient('scan-start', { images, params }, { timeoutMs: 30000, retries: 2 }) as { jobId?: string };
  if (!data?.jobId) throw new Error('Could not start the scan. Please try again.');
  return data.jobId;
}

// Poll the job row until it finishes. `onStatus` surfaces reading/recommending
// so the UI can update its progress copy. Resolves with the final result; the
// caller decides how to present a 'done' vs 'error'.
export async function pollScanJob(
  jobId: string,
  opts?: { onStatus?: (status: string) => void; isCancelled?: () => boolean },
): Promise<ScanJobResult> {
  const started = Date.now();
  let lastStatus = '';
  while (true) {
    if (opts?.isCancelled?.()) throw new Error('cancelled');
    const { data, error } = await supabase
      .from('scan_jobs')
      .select('status, extracted_wines, result, error')
      .eq('id', jobId)
      .maybeSingle();

    // A transient read error (blip) isn't fatal — keep polling until the ceiling.
    if (!error && data) {
      if (data.status !== lastStatus) { lastStatus = data.status; opts?.onStatus?.(data.status); }
      if (data.status === 'done') {
        return { status: 'done', wines: data.extracted_wines ?? null, recommendation: data.result ?? null, error: null };
      }
      if (data.status === 'error') {
        return { status: 'error', wines: data.extracted_wines ?? null, recommendation: null, error: data.error ?? null };
      }
    }

    if (Date.now() - started > POLL_TIMEOUT_MS) {
      throw new Error('This scan is taking longer than expected. Please try again.');
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}
