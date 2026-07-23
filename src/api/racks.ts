import { supabase } from './supabase';
import { invokeResilient } from './invokeResilient';
import type { WineRack, RackSlot } from '../types/wine';

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

// Change a rack's grid dimensions. Growing just bumps rows/cols — new cells are
// empty and need no rack_slots rows. Shrinking first drops any slot assignments
// that now fall outside the grid: standard cells at row_index >= rows OR
// col_index >= cols. The large-format band (row_index -1) has its own column
// count and is intentionally left untouched. Prune BEFORE updating dimensions so
// we never leave orphaned (still-counted) slots outside the visible grid.
export async function resizeRack(id: string, rows: number, cols: number): Promise<void> {
  const { error: pruneErr } = await supabase
    .from('rack_slots')
    .delete()
    .eq('rack_id', id)
    .gte('row_index', 0)
    .or(`row_index.gte.${rows},col_index.gte.${cols}`);
  if (pruneErr) throw pruneErr;
  const { error } = await supabase.from('wine_racks').update({ rows, cols }).eq('id', id);
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

// Per-rack bottle counts computed server-side in ONE query. A slot counts only
// when its wine is still live (non-archived, non-wishlist) — the `!inner` join
// on cellar_wines drops slots whose wine has been archived, matching what the
// cellar list shows. Replaces the old client-side rack_slots × cellar_wines
// join on the Home Storage screen, which rendered 0 on cold start until BOTH
// queries had landed.
export async function getRackBottleCounts(rackIds: string[]): Promise<Record<string, number>> {
  if (rackIds.length === 0) return {};
  const { data, error } = await supabase
    .from('rack_slots')
    .select('rack_id, wine:cellar_wines!inner(archived_at, is_wishlist)')
    .in('rack_id', rackIds)
    .is('wine.archived_at', null)
    .eq('wine.is_wishlist', false);
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as { rack_id: string }[]) {
    counts[row.rack_id] = (counts[row.rack_id] ?? 0) + 1;
  }
  return counts;
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
