import { supabase } from './supabase';

export async function callOCR(imageBase64: string): Promise<unknown> {
  console.log('[API] Invoking OCR Edge Function...');
  const { data, error } = await supabase.functions.invoke('ocr', {
    body: { imageBase64 },
  });
  if (error) throw new Error(`OCR function error: ${error.message}`);
  console.log('[API] OCR success');
  return data;
}

export async function callRecommend(payload: unknown): Promise<unknown> {
  console.log('[API] Invoking Recommend Edge Function...');
  const { data, error } = await supabase.functions.invoke('recommend', {
    body: payload,
  });
  if (error) throw new Error(`Recommend function error: ${error.message}`);
  console.log('[API] Recommend success');
  return data;
}
