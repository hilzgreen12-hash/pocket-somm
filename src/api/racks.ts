import { supabase } from './supabase';
import { invokeResilient } from './invokeResilient';
import type { WineRack, RackSlot } from '../types/wine';

export async function detectRack(base64Image: string): Promise<{ rows: number; cols: number }> {
  // Was a bare fetch with no timeout/retry — the worst-affected scan path on
  // cellular, since the image upload stalls before the (fast) server work even
  // starts. Routed through invokeResilient for the timeout + retry, and it now
  // carries the user's JWT instead of the bare anon key.
  return invokeResilient('detect-rack', { base64Image }) as Promise<{ rows: number; cols: number }>;
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

// Optional large-format row spec — passed when the user enabled "Insert
// large-format row" on the Confirm Rack/Fridge screen. Stored as two
// columns on wine_racks; both null when no large-format row.
export interface LargeFormatRowSpec { cols: number; bottleSizeMl: number }

export async function createRack(
  userId: string,
  name: string,
  rows: number,
  cols: number,
  storageType: 'rack' | 'fridge' = 'rack',
  largeFormat?: LargeFormatRowSpec | null,
): Promise<WineRack> {
  const insert: Record<string, unknown> = { user_id: userId, name, rows, cols, storage_type: storageType };
  if (largeFormat) {
    insert.large_format_cols = largeFormat.cols;
    insert.large_format_bottle_size_ml = largeFormat.bottleSizeMl;
  }
  const { data, error } = await supabase
    .from('wine_racks')
    .insert(insert)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteRack(id: string): Promise<void> {
  const { error } = await supabase.from('wine_racks').delete().eq('id', id);
  if (error) throw error;
}

export async function renameRack(id: string, name: string): Promise<void> {
  const { error } = await supabase.from('wine_racks').update({ name }).eq('id', id);
  if (error) throw error;
}

export async function wipeRackContents(rackId: string): Promise<void> {
  // Clears every slot assignment for this rack — the rack itself stays.
  const { error } = await supabase.from('rack_slots').delete().eq('rack_id', rackId);
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

export async function assignSlots(
  rackId: string,
  slots: Array<{ row: number; col: number }>,
  cellarWineId: string
): Promise<void> {
  if (slots.length === 0) return;
  const rows = slots.map((s) => ({
    rack_id: rackId,
    row_index: s.row,
    col_index: s.col,
    cellar_wine_id: cellarWineId,
  }));
  const { error } = await supabase
    .from('rack_slots')
    .upsert(rows, { onConflict: 'rack_id,row_index,col_index' });
  if (error) throw error;
}

export async function getSlotAssignments(rackIds: string[]): Promise<{ rack_id: string; cellar_wine_id: string }[]> {
  if (rackIds.length === 0) return [];
  const { data, error } = await supabase
    .from('rack_slots')
    .select('rack_id, cellar_wine_id')
    .in('rack_id', rackIds)
    .not('cellar_wine_id', 'is', null);
  if (error) throw error;
  return data ?? [];
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

export async function clearWineFromRacks(cellarWineId: string): Promise<void> {
  const { error } = await supabase.from('rack_slots').delete().eq('cellar_wine_id', cellarWineId);
  if (error) throw error;
}

export async function removeSlotsForWine(cellarWineId: string, count: number): Promise<number> {
  if (count <= 0) return 0;
  const { data, error } = await supabase
    .from('rack_slots')
    .select('id')
    .eq('cellar_wine_id', cellarWineId)
    .order('row_index', { ascending: false })
    .order('col_index', { ascending: false })
    .limit(count);
  if (error) throw error;
  if (!data || data.length === 0) return 0;
  const ids = data.map((s) => s.id);
  const { error: delErr } = await supabase.from('rack_slots').delete().in('id', ids);
  if (delErr) throw delErr;
  return ids.length;
}
