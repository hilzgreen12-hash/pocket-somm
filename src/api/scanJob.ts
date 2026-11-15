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
  // The real reason behind an error (small print on the error screen).
  failure?: string | null;
}

// A started job. pollToken is set for GUEST scans (no account, or an expired
// login): their job can't be read from the table, so it's polled through
// scan-start with this token instead.
export interface StartedScanJob { jobId: string; pollToken: string | null }

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 180000; // 3 min hard ceiling — well past a normal scan

// Kick off the background job. Returns the jobId immediately (sub-second).
// Pass `sourceUrl` (Find Online) instead of images to read a list from the web.
export async function startScanJob(images: string[], params: ScanJobParams, sourceUrl?: string): Promise<StartedScanJob> {
  const data = await invokeResilient('scan-start', sourceUrl ? { sourceUrl, params } : { images, params }, { timeoutMs: 30000, retries: 2 }) as { jobId?: string; pollToken?: string | null };
  if (!data?.jobId) throw new Error('Could not start the scan. Please try again.');
  return { jobId: data.jobId, pollToken: data.pollToken ?? null };
}

// Read one job's state: from the table for account holders, through scan-start
// (with the poll token) for guests.
async function readJob(job: StartedScanJob): Promise<{ status: string; extracted_wines: any; result: any; error: string | null; failure?: string | null } | null> {
  if (job.pollToken) {
    try {
      return await invokeResilient('scan-start', { action: 'poll', jobId: job.jobId, pollToken: job.pollToken }, { timeoutMs: 15000, retries: 1 }) as any;
    } catch { return null; }
  }
  const { data, error } = await supabase
    .from('scan_jobs')
    .select('status, extracted_wines, result, error, params')
    .eq('id', job.jobId)
    .maybeSingle();
  if (error || !data) return null;
  return { ...data, failure: (data as any).params?.failure ?? null };
}

// Report a failure that happened on the phone (before or while sending), with
// its reference code, so it shows in the server logs. Best-effort.
export function logScanClientError(input: { ref: string; stage: string; message: string; source: string; guest: boolean }): void {
  void invokeResilient('scan-start', { action: 'client_error', ...input }, { timeoutMs: 8000, retries: 0 }).catch(() => {});
}

// Poll the job row until it finishes. `onStatus` surfaces reading/recommending
// so the UI can update its progress copy. Resolves with the final result; the
// caller decides how to present a 'done' vs 'error'.
export async function pollScanJob(
  job: StartedScanJob,
  // timeoutMs: Find Online reads a whole web list, so it gets longer than a photo.
  opts?: { onStatus?: (status: string) => void; isCancelled?: () => boolean; timeoutMs?: number },
): Promise<ScanJobResult> {
  const started = Date.now();
  let lastStatus = '';
  while (true) {
    if (opts?.isCancelled?.()) throw new Error('cancelled');
    const data = await readJob(job);

    // A transient read error (blip) isn't fatal — keep polling until the ceiling.
    if (data) {
      if (data.status !== lastStatus) { lastStatus = data.status; opts?.onStatus?.(data.status); }
      if (data.status === 'done') {
        return { status: 'done', wines: data.extracted_wines ?? null, recommendation: data.result ?? null, error: null };
      }
      if (data.status === 'error') {
        return { status: 'error', wines: data.extracted_wines ?? null, recommendation: null, error: data.error ?? null, failure: data.failure ?? null };
      }
    }

    if (Date.now() - started > (opts?.timeoutMs ?? POLL_TIMEOUT_MS)) {
      throw new Error('This scan is taking longer than expected. Please try again.');
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}
