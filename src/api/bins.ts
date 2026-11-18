import { supabase } from './supabase';
import { cellarOwner, assertCanEditCellar, refusedWriteError } from './cellarContext';
import { fetchBinPlacementsForCells, clearBinCellPlacements } from './placements';
import { selectAllInChunks } from './paging';
import { buildBinCells } from '../utils/binGeometry';
import type { WineRack, BinCell, CellarWine } from '../types/wine';

// A bin is a wine_racks row with storage_type='bin': a frame of diamond cells
// (see utils/binGeometry). Which wines sit in a cell is recorded by 'bin'
// placements in cellar_placements (migration 116).

export async function getBins(userId: string): Promise<WineRack[]> {
  const { data, error } = await supabase
    .from('wine_racks')
    .select('*')
    .eq('user_id', cellarOwner(userId))
    .eq('storage_type', 'bin')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createBin(
  userId: string,
  name: string,
  across: number,
  down: number,
  diamondCapacity: number,
): Promise<WineRack> {
  const { data: bin, error } = await supabase
    .from('wine_racks')
    .insert({
      user_id: cellarOwner(userId),
      name,
      storage_type: 'bin',
      rows: null,
      cols: null,
      diamonds_across: across,
      diamonds_down: down,
      diamond_capacity: diamondCapacity,
    })
    .select()
    .single();
  if (error) throw error;

  const cells = buildBinCells(across, down, diamondCapacity).map((c) => ({ ...c, bin_id: bin.id }));
  const { error: cellErr } = await supabase.from('bin_cells').insert(cells);
  if (cellErr) {
    // Roll back the half-created bin so we never leave a cell-less unit behind.
    await supabase.from('wine_racks').delete().eq('id', bin.id);
    throw cellErr;
  }
  return bin;
}

// Delete a bin. Its cells cascade, and their bin placements with them, so the
// wines stay in the cellar as loose bottles — as when a rack is deleted.
export async function deleteBin(binId: string): Promise<void> {
  assertCanEditCellar();
  const { data, error } = await supabase.from('wine_racks').delete().eq('id', binId).select('id');
  if (error) throw error;
  if (!data?.length) throw refusedWriteError();
}

export async function renameBin(binId: string, name: string): Promise<void> {
  assertCanEditCellar();
  const { data, error } = await supabase.from('wine_racks').update({ name }).eq('id', binId).select('id');
  if (error) throw error;
  if (!data?.length) throw refusedWriteError();
}

// Which bin each cell belongs to. A 'bin' placement records only its cell, so
// this is how a list traces a bottle back to its bin.
export async function getBinOfCell(binIds: string[]): Promise<Map<string, string>> {
  const cells = await selectAllInChunks<{ id: string; bin_id: string }>(binIds, (chunk, from, to) =>
    supabase.from('bin_cells').select('id, bin_id').in('bin_id', chunk)
      .order('id', { ascending: true }).range(from, to));
  return new Map(cells.map((c) => [c.id, c.bin_id]));
}

// Empty every cell in a bin at once — the wines stay in the cellar (loose),
// they just lose their bin placements. Mirrors the rack "Wipe contents" action.
export async function emptyBin(binId: string): Promise<void> {
  const { data: cells, error: cellsErr } = await supabase.from('bin_cells').select('id').eq('bin_id', binId);
  if (cellsErr) throw cellsErr;
  const cellIds = (cells ?? []).map((c) => c.id);
  await clearBinCellPlacements(cellIds);
}

// The live wines in each of these cells, from their bin placements. Each keeps
// its whole-cellar `quantity`; `bin_cell_quantity` is how many of its bottles
// are in that cell and `bin_placement_id` the placement holding them.
async function resolveCellWines(cellIds: string[]): Promise<Record<string, CellarWine[]>> {
  const byCell: Record<string, CellarWine[]> = {};
  const placements = await fetchBinPlacementsForCells(cellIds);
  if (placements.length === 0) return byCell;
  const rows = await selectAllInChunks<CellarWine>(placements.map((p) => p.cellar_wine_id), (chunk, from, to) =>
    supabase.from('cellar_wines').select('*').in('id', chunk).is('archived_at', null)
      .order('id', { ascending: true }).range(from, to) as any);
  const wineById = new Map(rows.map((w) => [w.id, w]));
  // fetchBinPlacementsForCells orders by id, which keeps each cell's list stable.
  for (const p of placements) {
    const w = p.bin_cell_id ? wineById.get(p.cellar_wine_id) : undefined;
    if (w) (byCell[p.bin_cell_id!] ??= []).push({ ...w, bin_cell_quantity: p.quantity ?? 0, bin_placement_id: p.id });
  }
  return byCell;
}

// A bin's cells with the (live) wines filed into each, plus a summed bottle
// count per cell for the fill meter.
export async function getBinCells(binId: string): Promise<BinCell[]> {
  const { data: cells, error } = await supabase
    .from('bin_cells')
    .select('*')
    .eq('bin_id', binId)
    .order('idx', { ascending: true });
  if (error) throw error;

  const cellIds = (cells ?? []).map((c) => c.id);
  const byCell = await resolveCellWines(cellIds);

  return (cells ?? []).map((c) => {
    const cellWines = byCell[c.id] ?? [];
    return {
      ...c,
      wines: cellWines,
      bottleCount: cellWines.reduce((sum, w) => sum + (w.bin_cell_quantity ?? 0), 0),
    };
  });
}

// One cell with the live wines filed into it — for the cell contents screen.
export async function getBinCell(cellId: string): Promise<{ cell: BinCell; wines: CellarWine[] }> {
  const { data: cell, error } = await supabase
    .from('bin_cells')
    .select('*')
    .eq('id', cellId)
    .single();
  if (error) throw error;
  const byCell = await resolveCellWines([cellId]);
  return { cell, wines: byCell[cellId] ?? [] };
}

// Empty a whole cell — every wine in it loses its bin placement (bottles stay in
// the cellar, loose). Used by the long-press "Empty" action on the lattice.
export async function emptyBinCell(cellId: string): Promise<void> {
  await clearBinCellPlacements([cellId]);
}

// Bottles in each bin (live wines only), for the Home Storage tiles and tally.
export async function getBinBottleCounts(binIds: string[]): Promise<Record<string, number>> {
  const binByCell = await getBinOfCell(binIds);
  const rows = await selectAllInChunks<{ quantity: number; bin_cell_id: string }>([...binByCell.keys()], (chunk, from, to) =>
    supabase.from('cellar_placements')
      .select('id, quantity, bin_cell_id, wine:cellar_wines!inner(archived_at)')
      .eq('kind', 'bin')
      .in('bin_cell_id', chunk)
      .is('wine.archived_at', null)
      .order('id', { ascending: true })
      .range(from, to) as any);
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const binId = binByCell.get(row.bin_cell_id);
    if (binId) counts[binId] = (counts[binId] ?? 0) + (row.quantity ?? 0);
  }
  return counts;
}
