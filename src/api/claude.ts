import { invokeResilient, isNetworkError } from './invokeResilient';
import { streamRecommend } from './recommendStream';

// Thin alias kept so the call sites below read unchanged. The timeout, retry
// and friendly-error handling now live in invokeResilient (shared with the
// edge calls in label.ts) — see that file for why the resilience matters on
// cellular.
async function invokeFunction(name: string, body: unknown): Promise<unknown> {
  return invokeResilient(name, body);
}

export async function callOCR(imageBase64: string): Promise<unknown> {
  console.log('[API] Invoking OCR Edge Function...');
  const data = await invokeFunction('ocr', { imageBase64 });
  console.log('[API] OCR success');
  return data;
}

export async function callRecommend(payload: unknown): Promise<unknown> {
  console.log('[API] Invoking Recommend Edge Function...');
  // Prefer the streamed path: this ~60s+ generation on a long wine list is the
  // one that times out (~64s) as a single idle request; a heartbeat-kept SSE
  // connection survives it (a small list finishes under the cutoff either way).
  // Fall back to the buffered invoke if streaming drops after its own retries or
  // isn't supported on the device. A real application error (not a transport
  // drop) propagates without falling back.
  try {
    const data = await streamRecommend(payload as Record<string, unknown>);
    console.log('[API] Recommend success (streamed)');
    return data;
  } catch (err) {
    if (!isNetworkError(err)) throw err;
    const data = await invokeFunction('recommend', payload);
    console.log('[API] Recommend success (buffered fallback)');
    return data;
  }
}

