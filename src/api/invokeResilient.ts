import { supabase } from './supabase';

// Resilient wrapper around supabase.functions.invoke.
//
// Why this exists: every edge call in the app is a single HTTP request held
// open for the whole AI round-trip (5–65s). On WiFi that's fine; on cellular,
// carrier NAT idle-timeouts, signal dips and tower handovers routinely sever a
// long-held connection, and large base64 image uploads stall before they ever
// reach the server. With no timeout and no retry, a single transient drop
// surfaced straight to the user as a hard failure — which is why testers
// reported the scan features "only work on WiFi".
//
// This helper adds:
//   - a per-call timeout (so a dead connection fails fast instead of hanging),
//   - automatic retry with backoff on TRANSPORT failures only, and
//   - a tagged NetworkError so the UI can show a "weak signal" message.
//
// Crucially it does NOT retry real application errors (429 rate-limit, 400,
// 500 from the function body): those come back as FunctionsHttpError with a
// Response attached, and retrying would double-charge AI calls and mask
// genuine problems.

export interface InvokeOptions {
  /** Abandon (and maybe retry) a single attempt after this many ms. */
  timeoutMs?: number;
  /** Number of *additional* attempts after the first. */
  retries?: number;
}

// The long AI generations (recommend, generate-pairings) can legitimately run
// ~65s server-side, so the ceiling has to clear that with headroom.
const DEFAULT_TIMEOUT_MS = 90000;
const DEFAULT_RETRIES = 2;

class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

function withTimeout<T>(p: Promise<T>, ms: number, name: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new TimeoutError(`${name} timed out after ${ms}ms`)),
      ms,
    );
    p.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

// A transient error is one where the request never got a complete response:
// FunctionsFetchError (network/DNS/TLS/connection drop — the classic cellular
// failure), our own TimeoutError, or a bare TypeError ("Network request
// failed" from React Native's fetch). FunctionsHttpError is NOT transient — it
// carries a Response, meaning the server answered with a non-2xx, which is a
// real application error we must surface immediately.
function isTransient(err: unknown): boolean {
  const name = (err as { name?: string } | null)?.name;
  return name === 'FunctionsFetchError' || name === 'TimeoutError' || name === 'TypeError';
}

async function friendlyMessage(name: string, err: unknown): Promise<string> {
  const ctx = (err as { context?: Response } | null)?.context;
  if (ctx && typeof ctx.json === 'function') {
    try {
      const body = await ctx.json();
      if (body?.message) return body.message;
      if (body?.error) return `${name} error: ${body.error}`;
    } catch {
      /* body wasn't JSON — fall through */
    }
  }
  const msg = (err as { message?: string } | null)?.message;
  return `${name}: ${msg ?? 'request failed'}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function invokeResilient(
  name: string,
  body: unknown,
  options: InvokeOptions = {},
): Promise<unknown> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = options.retries ?? DEFAULT_RETRIES;

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { data, error } = await withTimeout(
        supabase.functions.invoke(name, { body: body as Record<string, unknown> }),
        timeoutMs,
        name,
      );
      if (error) {
        // Server answered with non-2xx → real app error, don't retry.
        if (!isTransient(error)) {
          throw new Error(await friendlyMessage(name, error));
        }
        lastError = error; // transient → fall through to retry
      } else {
        return data;
      }
    } catch (err) {
      // A friendly app error thrown just above (or any non-transient throw)
      // must propagate without retrying.
      if (err instanceof Error && err.name !== 'TimeoutError' && !isTransient(err)) {
        throw err;
      }
      lastError = err;
    }

    // Backoff before the next attempt: 800ms, then 1600ms. Short enough not to
    // leave the user staring, long enough to ride out a brief signal dip.
    if (attempt < retries) {
      await delay(800 * 2 ** attempt);
    }
  }

  // Every attempt was a transport failure/timeout — tag it so the UI can show
  // a connection-specific message rather than the generic "couldn't read it".
  const err = new Error(await friendlyMessage(name, lastError));
  err.name = 'NetworkError';
  throw err;
}

// True when an error came from this module's transport-failure path. Lets
// screens swap in a "you're offline / weak signal" message and a real retry.
export function isNetworkError(err: unknown): boolean {
  const name = (err as { name?: string } | null)?.name;
  if (name === 'NetworkError' || name === 'TimeoutError') return true;
  const msg = (err as { message?: string } | null)?.message ?? '';
  return /network|timed out|timeout|connection|offline/i.test(msg);
}
