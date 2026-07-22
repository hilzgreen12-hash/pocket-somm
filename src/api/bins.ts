import { supabase } from './supabase';
import type { WineRack, BinCell, CellarWine } from '../types/wine';

// A bin is a wine_racks row with storage_type='bin'. It is a grid of diamonds:
// interior cells are full diamonds, cells on the edge of the unit are triangles
// holding half a diamond's capacity.

export interface BinCellSpec { idx: number; kind: 'diamond' | 'triangle'; capacity: number }

// The number of half-diamond TRIANGLES that fill the perimeter gaps around an
// across × down block of full diamonds — one per diamond along each of the four
// edges. (A 2×2 block → 8 edge triangles.) Kept as a named helper so the sizer
// preview and the DB cell generation always agree.
export function binTriangleCount(across: number, down: number): number {
  return 2 * (across + down);
}

// Build the cell list for a diamond bin: an across × down grid of FULL diamonds,
// then the perimeter triangles filling the edge gaps around them. Triangles hold
// half a diamond's capacity (rounded down, min 1).
export function buildBinCells(across: number, down: number, diamondCapacity: number): BinCellSpec[] {
  const cells: BinCellSpec[] = [];
  let idx = 0;
  for (let r = 0; r < down; r++) {
    for (let c = 0; c < across; c++) {
      cells.push({ idx: idx++, kind: 'diamond', capacity: diamondCapacity });
    }
  }
  const triCap = Math.max(1, Math.floor(diamondCapacity / 2));
  const triangles = binTriangleCount(across, down);
  for (let t = 0; t < triangles; t++) {
    cells.push({ idx: idx++, kind: 'triangle', capacity: triCap });
  }
  return cells;
}

// Total bottle capacity of a unit before it's created (for the create-screen
// preview) — sum of every cell's capacity.
export function binTotalCapacity(across: number, down: number, diamondCapacity: number): number {
  return buildBinCells(across, down, diamondCapacity).reduce((sum, c) => sum + c.capacity, 0);
}

export async function getBins(userId: string): Promise<WineRack[]> {
  const { data, error } = await supabase
    .from('wine_racks')
    .select('*')
    .eq('user_id', userId)
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
      user_id: userId,
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

export async function deleteBin(binId: string): Promise<void> {
  // bin_cells cascade on the FK; cellar_wines.bin_cell_id is set null by its FK,
  // so the wines survive (loose) — matching how deleting a rack frees its wines.
  const { error } = await supabase.from('wine_racks').delete().eq('id', binId);
  if (error) throw error;
}

// A bin's cells with the (live) wines filed into each, plus a summed bottle
// count per cell for the fill meter. Wishlist/archived wines are excluded, as
// on the rack path.
export async function getBinCells(binId: string): Promise<BinCell[]> {
  const { data: cells, error } = await supabase
    .from('bin_cells')
    .select('*')
    .eq('bin_id', binId)
    .order('idx', { ascending: true });
  if (error) throw error;

  const cellIds = (cells ?? []).map((c) => c.id);
  const byCell: Record<string, CellarWine[]> = {};
  if (cellIds.length > 0) {
    const { data: binWines, error: bwErr } = await supabase
      .from('cellar_wines')
      .select('*')
      .in('bin_cell_id', cellIds)
      .is('archived_at', null)
      .eq('is_wishlist', false);
    if (bwErr) throw bwErr;
    for (const w of (binWines ?? []) as CellarWine[]) {
      if (!w.bin_cell_id) continue;
      (byCell[w.bin_cell_id] ??= []).push(w);
    }
  }

  return (cells ?? []).map((c) => {
    const cellWines = byCell[c.id] ?? [];
    return {
      ...c,
      wines: cellWines,
      bottleCount: cellWines.reduce((sum, w) => sum + (w.quantity ?? 0), 0),
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

  const { data: wines, error: wineErr } = await supabase
    .from('cellar_wines')
    .select('*')
    .eq('bin_cell_id', cellId)
    .is('archived_at', null)
    .eq('is_wishlist', false)
    .order('created_at', { ascending: true });
  if (wineErr) throw wineErr;
  return { cell, wines: (wines ?? []) as CellarWine[] };
}

// Take a wine out of its bin cell — the bottles stay in the cellar (loose), the
// row just loses its cell pointer. Mirrors "remove from location" / clearing a
// rack slot: the wine is never destroyed by leaving its container.
export async function removeWineFromCell(cellarWineId: string): Promise<void> {
  const { error } = await supabase
    .from('cellar_wines')
    .update({ bin_cell_id: null, updated_at: new Date().toISOString() })
    .eq('id', cellarWineId);
  if (error) throw error;
}

// Per-bin total bottle counts (for the Home Storage carousel cards + tally),
// computed in one query. Live wines only.
export async function getBinBottleCounts(binIds: string[]): Promise<Record<string, number>> {
  if (binIds.length === 0) return {};
  const { data, error } = await supabase
    .from('bin_cells')
    .select('bin_id, wines:cellar_wines!inner(quantity, archived_at, is_wishlist)')
    .in('bin_id', binIds)
    .is('wines.archived_at', null)
    .eq('wines.is_wishlist', false);
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as { bin_id: string; wines: { quantity: number }[] }[]) {
    const cellTotal = (row.wines ?? []).reduce((s, w) => s + (w.quantity ?? 0), 0);
    counts[row.bin_id] = (counts[row.bin_id] ?? 0) + cellTotal;
  }
  return counts;
}
