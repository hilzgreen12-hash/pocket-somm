import { fetch as streamingFetch } from 'expo/fetch';
import { supabase } from './supabase';

// Streaming client for the OCR (wine-list read) edge function.
//
// Why this exists: reading a long wine list takes Sonnet ~45s+ (the dominant
// cost of a scan), and a single buffered HTTP connection held open that long
// risks an intermediary severing it — and on the client the 90s timeout would
// then retry the whole 45s+ call. The edge function keeps the connection alive
// with an SSE heartbeat every few seconds; this reader consumes that stream,
// treats a gap in traffic (not a slow total) as a dropped connection, and
// retries the transport.
//
// The final result arrives as a single SSE `data:` frame carrying either the
// parsed wines ({ wines: [...] }) or { error, message }. Heartbeats are SSE
// comment lines (": ...") and are ignored. If streaming isn't available on the
// device we throw a NetworkError so the caller can fall back to buffered invoke.

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/ocr`;

// No bytes for this long ⇒ assume the connection died and abort. The heartbeat
// is 8s, so 30s of silence is unambiguous (≥3 missed pings) without being
// trigger-happy on a brief signal dip.
const IDLE_TIMEOUT_MS = 30000;
const RETRIES = 2;

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

async function streamOnce(imageBase64: string): Promise<unknown> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? SUPABASE_ANON_KEY;

  if (typeof TextDecoder === 'undefined') {
    throw new NetworkError('streaming unsupported: no TextDecoder');
  }

  const controller = new AbortController();
  let idleTimer: ReturnType<typeof setTimeout> | undefined;
  const armIdle = () => {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => controller.abort(), IDLE_TIMEOUT_MS);
  };

  let res: Response;
  try {
    armIdle();
    res = await streamingFetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON_KEY,
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({ imageBase64, stream: true }),
      signal: controller.signal,
    }) as unknown as Response;
  } catch (err) {
    if (idleTimer) clearTimeout(idleTimer);
    throw new NetworkError(`ocr request failed: ${(err as Error)?.message ?? 'network'}`);
  }

  if (!res.ok) {
    if (idleTimer) clearTimeout(idleTimer);
    let detail = '';
    try { detail = await res.text(); } catch { /* ignore */ }
    // Non-2xx from the platform/gateway (incl. the 429 rate-limit) — a real
    // error, not a retryable drop. Surface the server's message when present.
    try {
      const parsed = JSON.parse(detail);
      if (parsed?.message) throw new Error(parsed.message);
    } catch { /* not JSON — fall through */ }
    throw new Error(`ocr ${res.status}: ${detail.slice(0, 200)}`);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    if (idleTimer) clearTimeout(idleTimer);
    throw new NetworkError('streaming unsupported: no readable body');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let payload: { error?: string; message?: string; [k: string]: unknown } | null = null;

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      armIdle(); // fresh bytes (heartbeat or result) ⇒ connection is alive
      buffer += decoder.decode(value, { stream: true });
      let sep: number;
      while ((sep = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        for (const line of frame.split('\n')) {
          if (line.startsWith('data:')) {
            const json = line.slice(5).trim();
            if (json) payload = JSON.parse(json);
          }
        }
      }
    }
  } catch (err) {
    throw new NetworkError(`ocr stream interrupted: ${(err as Error)?.message ?? 'drop'}`);
  } finally {
    if (idleTimer) clearTimeout(idleTimer);
  }

  if (!payload) throw new NetworkError('ocr stream ended without a result');
  // A server-side application error (bad JSON from Claude) is NOT a transport
  // problem — surface it directly so we don't pointlessly retry.
  if (payload.error) throw new Error(payload.message ?? payload.error);
  return payload;
}

// Stream the wine-list read, retrying only on transport drops / idle timeouts
// (never on an application error). On exhaustion throws a NetworkError so the
// caller can fall back to the buffered path.
export async function streamOCR(imageBase64: string): Promise<unknown> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    try {
      return await streamOnce(imageBase64);
    } catch (err) {
      if (!(err instanceof NetworkError)) throw err; // app error — don't retry
      lastError = err;
      if (attempt < RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 800 * 2 ** attempt));
      }
    }
  }
  const err = new Error((lastError as Error)?.message ?? 'ocr stream failed');
  err.name = 'NetworkError';
  throw err;
}
