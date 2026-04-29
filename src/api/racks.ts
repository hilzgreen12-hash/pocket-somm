import { supabase } from './supabase';
import type { WineRack, RackSlot } from '../types/wine';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export async function detectRack(base64Image: string): Promise<{ rows: number; cols: number }> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/detect-rack`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({ base64Image }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`detect-rack error ${res.status}: ${text}`);
  return JSON.parse(text);
}

export async function getRacks(userId: string): Promise<WineRack[]> {
  const { data, error } = await supabase
    .from('wine_racks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createRack(userId: string, name: string, rows: number, cols: number, storageType: 'rack' | 'fridge' = 'rack'): Promise<WineRack> {
  const { data, error } = await supabase
    .from('wine_racks')
    .insert({ user_id: userId, name, rows, cols, storage_type: storageType })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteRack(id: string): Promise<void> {
  const { error } = await supabase.from('wine_racks').delete().eq('id', id);
  if (error) throw error;
}

export async function getRackSlots(rackId: string): Promise<RackSlot[]> {
  const { data, error } = await supabase
    .from('rack_slots')
    .select('*, wine:cellar_wine_id(*)')
    .eq('rack_id', rackId);
  if (error) throw error;
  return data ?? [];
}

export async function assignSlot(rackId: string, rowIndex: number, colIndex: number, cellarWineId: string): Promise<void> {
  const { error } = await supabase
    .from('rack_slots')
    .upsert({ rack_id: rackId, row_index: rowIndex, col_index: colIndex, cellar_wine_id: cellarWineId },
      { onConflict: 'rack_id,row_index,col_index' });
  if (error) throw error;
}

export async function clearSlot(rackId: string, rowIndex: number, colIndex: number): Promise<void> {
  const { error } = await supabase
    .from('rack_slots')
    .delete()
    .eq('rack_id', rackId)
    .eq('row_index', rowIndex)
    .eq('col_index', colIndex);
  if (error) throw error;
}
