import { invokeResilient } from './invokeResilient';

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
  const data = await invokeFunction('recommend', payload);
  console.log('[API] Recommend success');
  return data;
}
