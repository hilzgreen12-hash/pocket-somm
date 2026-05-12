import { supabase } from './supabase';

async function invokeFunction(name: string, body: unknown): Promise<unknown> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    // supabase-js wraps non-2xx responses in FunctionsHttpError and exposes
    // the underlying Response on error.context. For rate-limit (429) and
    // other handled error cases the function sends a `message` field that's
    // already user-friendly — surface that verbatim instead of the generic
    // "ocr error: Edge Function returned a non-2xx status code".
    const ctx = (error as { context?: Response }).context;
    let friendlyMessage: string | null = null;
    if (ctx && typeof ctx.json === 'function') {
      try {
        const errBody = await ctx.json();
        if (errBody?.message) friendlyMessage = errBody.message;
        else if (errBody?.error) friendlyMessage = `${name} error: ${errBody.error}`;
      } catch { /* body wasn't JSON — fall through to the generic path */ }
    }
    throw new Error(friendlyMessage ?? `${name} error: ${error.message}`);
  }
  return data;
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
