import { supabase } from './supabase';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

async function invokeFunction(name: string, body: unknown): Promise<unknown> {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token ?? ANON_KEY}`,
      'apikey': ANON_KEY,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${name} error ${res.status}: ${text}`);
  return JSON.parse(text);
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
