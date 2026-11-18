import { supabase } from './supabase';
import { cellarOwner, assertCanEditCellar, refusedWriteError, VIEW_ONLY_MESSAGE } from './cellarContext';
import { selectAllInChunks } from './paging';
import type { WineRack, RackSlot } from '../types/wine';

export type SlotPos = { row: number; col: number };

export async function getRacks(userId: string): Promise<WineRack[]> {
  const { data, error } = await supabase
    .from('wine_racks')
    .select('*')
    .eq('user_id', cellarOwner(userId))
    .order('created_at', { ascending: false });
  if (error) throw error;
  // Bins live in wine_racks too (storage_type='bin') but have their own list/
  // screens — exclude them here so they don't also render as grid-less "rack"
  // cards. Filtered client-side to keep any legacy null-storage_type racks.
  return (data ?? []).filter((r) => r.storage_type !== 'bin');
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
  assertCanEditCellar();
  const insert: Record<string, unknown> = { user_id: cellarOwner(userId), name, rows, cols, storage_type: storageType };
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

// Deleting the unit cascades its slots; the wines stay in the cellar, unplaced.
export async function deleteRack(id: string): Promise<void> {
  assertCanEditCellar();
  const { data, error } = await supabase.from('wine_racks').delete().eq('id', id).select('id');
  if (error) throw error;
  if (!data?.length) throw refusedWriteError();
}

// Change a rack's grid dimensions. Growing just bumps rows/cols — new cells are
// empty and need no rack_slots rows. Shrinking first drops any slot assignments
// that now fall outside the grid: standard cells at row_index >= rows OR
// col_index >= cols. The large-format band (row_index -1) has its own column
// count and is intentionally left untouched. Prune BEFORE updating dimensions so
// we never leave orphaned (still-counted) slots outside the visible grid.
export async function resizeRack(id: string, rows: number, cols: number): Promise<void> {
  assertCanEditCellar();
  const { error: pruneErr } = await supabase
    .from('rack_slots')
    .delete()
    .eq('rack_id', id)
    .gte('row_index', 0)
    .or(`row_index.gte.${rows},col_index.gte.${cols}`);
  if (pruneErr) throw pruneErr;
  const { data, error } = await supabase.from('wine_racks').update({ rows, cols }).eq('id', id).select('id');
  if (error) throw error;
  if (!data?.length) throw refusedWriteError();
}

export async function renameRack(id: string, name: string): Promise<void> {
  assertCanEditCellar();
  const { data, error } = await supabase.from('wine_racks').update({ name }).eq('id', id).select('id');
  if (error) throw error;
  if (!data?.length) throw refusedWriteError();
}

// Clears every slot assignment for this rack — the rack itself stays. Returns
// how many bottles were unplaced.
export async function wipeRackContents(rackId: string): Promise<number> {
  assertCanEditCellar();
  const { data, error } = await supabase.from('rack_slots').delete().eq('rack_id', rackId).select('id');
  if (error) throw error;
  return data?.length ?? 0;
}

export async function getRackSlots(rackId: string): Promise<RackSlot[]> {
  // One unit is at most 30 × 30 plus a large-format band, so one page is enough.
  const { data, error } = await supabase
    .from('rack_slots')
    .select('*, wine:cellar_wine_id(*)')
    .eq('rack_id', rackId);
  if (error) throw error;
  return data ?? [];
}

// Put one bottle of a wine in each of `slots`, never over a bottle that's
// already there: a slot that was taken meanwhile (another tap, another device)
// is skipped, not overwritten. Returns the slots actually filled.
export async function assignSlots(rackId: string, slots: SlotPos[], cellarWineId: string): Promise<SlotPos[]> {
  if (slots.length === 0) return [];
  assertCanEditCellar();
  const rows = slots.map((s) => ({ rack_id: rackId, row_index: s.row, col_index: s.col, cellar_wine_id: cellarWineId }));
  const { data, error } = await supabase
    .from('rack_slots')
    .upsert(rows, { onConflict: 'rack_id,row_index,col_index', ignoreDuplicates: true })
    .select('row_index, col_index');
  if (error) throw error;
  return (data ?? []).map((s) => ({ row: s.row_index, col: s.col_index }));
}

// Which wine sits in each slot of these units, read in pages (a big cellar can
// hold more than PostgREST's 1000-row cap).
export async function getSlotAssignments(rackIds: string[]): Promise<{ rack_id: string; cellar_wine_id: string }[]> {
  if (rackIds.length === 0) return [];
  return selectAllInChunks<{ rack_id: string; cellar_wine_id: string }>(rackIds, (chunk, from, to) =>
    supabase
      .from('rack_slots')
      .select('rack_id, cellar_wine_id')
      .in('rack_id', chunk)
      .not('cellar_wine_id', 'is', null)
      .order('id', { ascending: true })
      .range(from, to) as any);
}

// Per-rack bottle counts. A slot counts only when its wine is still live
// (non-archived) — the `!inner` join on cellar_wines drops slots whose wine has
// been archived, matching what the cellar list shows. Paged like
// getSlotAssignments.
export async function getRackBottleCounts(rackIds: string[]): Promise<Record<string, number>> {
  if (rackIds.length === 0) return {};
  const rows = await selectAllInChunks<{ rack_id: string }>(rackIds, (chunk, from, to) =>
    supabase
      .from('rack_slots')
      .select('rack_id, wine:cellar_wines!inner(archived_at)')
      .in('rack_id', chunk)
      .is('wine.archived_at', null)
      .order('id', { ascending: true })
      .range(from, to) as any);
  const counts: Record<string, number> = {};
  for (const row of rows) counts[row.rack_id] = (counts[row.rack_id] ?? 0) + 1;
  return counts;
}

// Free one slot only if it still holds this wine — a screen's idea of what sits
// in a slot can be out of date. Returns whether a bottle was freed.
export async function clearSlotOfWine(rackId: string, rowIndex: number, colIndex: number, cellarWineId: string): Promise<boolean> {
  assertCanEditCellar();
  const { data, error } = await supabase
    .from('rack_slots')
    .delete()
    .eq('rack_id', rackId)
    .eq('row_index', rowIndex)
    .eq('col_index', colIndex)
    .eq('cellar_wine_id', cellarWineId)
    .select('id');
  if (error) throw error;
  return (data ?? []).length > 0;
}

export async function clearWineFromRacks(cellarWineId: string): Promise<void> {
  assertCanEditCellar();
  const { error } = await supabase.from('rack_slots').delete().eq('cellar_wine_id', cellarWineId);
  if (error) throw error;
}

// Free up to `count` of a wine's slots. Pass `rackId` to scope removal to a
// SINGLE rack/storage unit — essential when a wine is placed in more than one
// unit (e.g. a rack AND the fridge): a delete issued from one unit must only
// free that unit's bottles, never another unit's. Without a rackId it frees
// across all racks (used for whole-wine moves and removals). Returns how many
// slots were actually freed.
export async function removeSlotsForWine(cellarWineId: string, count: number, rackId?: string): Promise<number> {
  if (count <= 0) return 0;
  assertCanEditCellar();
  let q = supabase
    .from('rack_slots')
    .select('id')
    .eq('cellar_wine_id', cellarWineId);
  if (rackId) q = q.eq('rack_id', rackId);
  const { data, error } = await q
    .order('row_index', { ascending: false })
    .order('col_index', { ascending: false })
    .limit(count);
  if (error) throw error;
  if (!data || data.length === 0) return 0;
  const { data: deleted, error: delErr } = await supabase
    .from('rack_slots')
    .delete()
    .in('id', data.map((s) => s.id))
    .eq('cellar_wine_id', cellarWineId)
    .select('id');
  if (delErr) throw delErr;
  // Slots another device emptied meanwhile simply don't count as freed.
  return deleted?.length ?? 0;
}

// What move_rack_slot (migration 138) refused, in the app's own words.
const MOVE_REFUSALS: Record<string, string> = {
  rack_missing: 'That rack or fridge no longer exists.',
  rack_other_cellar: 'Bottles can only move between racks in the same cellar.',
  cellar_view_only: VIEW_ONLY_MESSAGE,
  rack_slot_off_grid: 'That slot is no longer part of the rack.',
  rack_slot_source_changed: 'That bottle is no longer in the slot you picked it up from — the rack has been refreshed.',
  rack_slot_target_changed: 'That slot has changed since you looked — the rack has been refreshed.',
  rack_slot_wine_archived: 'That bottle has been archived, so it can no longer be moved.',
  rack_slot_refused: 'That change could not be saved — please pull to refresh.',
};

export class RackMoveRefused extends Error {
  constructor(readonly reason: string) {
    super(MOVE_REFUSALS[reason] ?? 'Could not move the bottle. Please try again.');
  }
}

// Move one bottle from a slot to another slot (any rack of the same cellar), or
// swap it with the bottle there, in one transaction. `expectedTarget` is the
// wine the screen shows in the target slot (null = empty): if either slot has
// changed, nothing is written and RackMoveRefused says why.
export async function moveRackSlot(
  wineId: string,
  from: SlotPos & { rackId: string },
  to: SlotPos & { rackId: string },
  expectedTarget: string | null,
): Promise<'moved' | 'swapped'> {
  assertCanEditCellar();
  const { data, error } = await supabase.rpc('move_rack_slot', {
    p_wine_id: wineId,
    p_from_rack: from.rackId, p_from_row: from.row, p_from_col: from.col,
    p_to_rack: to.rackId, p_to_row: to.row, p_to_col: to.col,
    p_expected_to_wine: expectedTarget,
  });
  if (error) {
    const reason = Object.keys(MOVE_REFUSALS).find((k) => error.message?.includes(k));
    if (reason) throw new RackMoveRefused(reason);
    throw error;
  }
  return data as 'moved' | 'swapped';
}
