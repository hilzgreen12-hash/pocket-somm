import { supabase } from './supabase';

async function invokeFunction(name: string, body: unknown): Promise<unknown> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw new Error(`${name} error: ${error.message}`);
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
