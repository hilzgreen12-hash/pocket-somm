import { supabase } from './supabase';
import { cellarOwner } from './cellarContext';
import { fetchBinPlacementsForCells, clearBinCellPlacements, removeWineFromBinCell } from './placements';
import type { WineRack, BinCell, CellarWine } from '../types/wine';

// A bin is a wine_racks row with storage_type='bin'. It is a grid of diamonds:
// interior cells are full diamonds, cells on the edge of the unit are triangles
// holding half a diamond's capacity.

export interface BinCellSpec { idx: number; kind: 'diamond' | 'triangle'; capacity: number }

// Counts derived from the actual diamond tessellation clipped to the frame (see
// the geometry diagram + app/cellar/bin/resize.tsx), so the stored cells match
// the drawing cell-for-cell.
//
// Full DIAMONDS: the across × down grid PLUS the interleaved half-row diamonds
// that sit between them — (across-1) × (down-1) extra. A 2×2 frame → 5 diamonds.
export function binDiamondCount(across: number, down: number): number {
  return across * down + Math.max(0, across - 1) * Math.max(0, down - 1);
}

// TRIANGLES: every diamond the frame clips along its edges — 2 × (across+down),
// counting the corner pieces as triangles too (so there are only two cell types,
// not fiddly quarter-cubbies). A 2×2 frame → 8 triangles.
export function binTriangleCount(across: number, down: number): number {
  return 2 * (across + down);
}

// Build the cell list for a diamond bin so it mirrors the drawing: the full
// diamonds first, then the edge triangles. Triangles hold half a diamond's
// capacity (rounded down, min 1).
export function buildBinCells(across: number, down: number, diamondCapacity: number): BinCellSpec[] {
  const cells: BinCellSpec[] = [];
  let idx = 0;
  const diamonds = binDiamondCount(across, down);
  for (let i = 0; i < diamonds; i++) {
    cells.push({ idx: idx++, kind: 'diamond', capacity: diamondCapacity });
  }
  const triCap = Math.max(1, Math.floor(diamondCapacity / 2));
  const triangles = binTriangleCount(across, down);
  for (let i = 0; i < triangles; i++) {
    cells.push({ idx: idx++, kind: 'triangle', capacity: triCap });
  }
  return cells;
}

// --- Grid references -------------------------------------------------------
// Every full diamond (D) and half diamond (HD) gets a human reference so a cubby
// can be named — rows are letters (top→bottom, A first), columns are numbers
// (left→right within a row, 1 first), and a reference reads prefix+column+row
// e.g. D2B (diamond, column 2, row B) or HD3C (half diamond, column 3, row C).
// The quarter diamonds in the four corners are ignored (no reference). Labels
// are aligned to the tessellation emit order
// (see tessellate() in the bin screen): diamonds in geo.full order, triangles in
// geo.clipped order — so they pair 1:1 with the stored cells' idx.
export interface BinLabelInfo {
  diamondLabels: (string | null)[];
  triangleLabels: (string | null)[];
}

function columnLetter(i: number): string {
  let s = '';
  let n = i + 1;
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export function binCellLabels(across: number, down: number): BinLabelInfo {
  const E = 1e-9;
  type P = { x: number; y: number; full: boolean; corner: boolean };
  const full: P[] = [];
  const clipped: P[] = [];
  for (let jj = -1; jj <= down * 2 + 1; jj++) {
    const y = jj / 2;
    const offset = Math.abs(jj) % 2 === 0 ? 0 : 0.5;
    for (let x = offset - 1; x <= across + 1 + E; x += 1) {
      if (x + 0.5 <= E || x - 0.5 >= across - E || y + 0.5 <= E || y - 0.5 >= down - E) continue;
      const isFull = x - 0.5 >= -E && x + 0.5 <= across + E && y - 0.5 >= -E && y + 0.5 <= down + E;
      const clipX = x - 0.5 < -E || x + 0.5 > across + E;
      const clipY = y - 0.5 < -E || y + 0.5 > down + E;
      const corner = clipX && clipY; // clipped on both axes → quarter diamond
      (isFull ? full : clipped).push({ x, y, full: isFull, corner });
    }
  }

  const labelable = [...full, ...clipped].filter((p) => !p.corner);
  const ys = Array.from(new Set(labelable.map((p) => p.y))).sort((a, b) => a - b);
  const rowLetter = new Map<number, string>();
  ys.forEach((y, i) => rowLetter.set(y, columnLetter(i)));

  const labelOf = new Map<P, string>();
  for (const y of ys) {
    const rowCells = labelable.filter((p) => p.y === y).sort((a, b) => a.x - b.x);
    rowCells.forEach((p, i) => {
      // Reference reads prefix + column-number + row-letter, e.g. D2B / HD3C.
      labelOf.set(p, `${p.full ? 'D' : 'HD'}${i + 1}${rowLetter.get(y)}`);
    });
  }

  return {
    diamondLabels: full.map((p) => labelOf.get(p) ?? null),
    triangleLabels: clipped.map((p) => labelOf.get(p) ?? null),
  };
}

// Label for one stored cell, keyed off its idx (diamonds occupy idx 0..D-1 in
// geo.full order, triangles the rest in geo.clipped order). Null for corners.
export function binCellLabel(across: number, down: number, kind: 'diamond' | 'triangle', idx: number): string | null {
  const labels = binCellLabels(across, down);
  return kind === 'diamond'
    ? labels.diamondLabels[idx] ?? null
    : labels.triangleLabels[idx - binDiamondCount(across, down)] ?? null;
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

export async function deleteBin(binId: string): Promise<void> {
  // bin_cells cascade on the FK; cellar_wines.bin_cell_id is set null by its FK,
  // so the wines survive (loose) — matching how deleting a rack frees its wines.
  const { error } = await supabase.from('wine_racks').delete().eq('id', binId);
  if (error) throw error;
}

// Rename a bin (bins are wine_racks rows, same as racks/fridges).
export async function renameBin(binId: string, name: string): Promise<void> {
  const { error } = await supabase.from('wine_racks').update({ name }).eq('id', binId);
  if (error) throw error;
}

// Empty every cell in a bin at once — the wines stay in the cellar (loose),
// they just lose their bin placements. Mirrors the rack "Wipe contents" action.
export async function emptyBin(binId: string): Promise<void> {
  const { data: cells, error: cellsErr } = await supabase.from('bin_cells').select('id').eq('bin_id', binId);
  if (cellsErr) throw cellsErr;
  const cellIds = (cells ?? []).map((c) => c.id);
  await clearBinCellPlacements(cellIds);
}

// Resolve a set of bin cells' wines from their 'bin' placements (mig 116: bin
// membership lives in cellar_placements now). Each returned wine's `quantity` is
// overridden to the bottles IN THAT CELL, and `bin_placement_id` carries the
// placement row (for per-cell remove/archive/decrement). Archived/wishlist wines
// are excluded, as on the rack path.
async function resolveCellWines(cellIds: string[]): Promise<Record<string, CellarWine[]>> {
  const byCell: Record<string, CellarWine[]> = {};
  if (cellIds.length === 0) return byCell;
  const placements = await fetchBinPlacementsForCells(cellIds);
  if (placements.length === 0) return byCell;
  const wineIds = Array.from(new Set(placements.map((p) => p.cellar_wine_id)));
  const { data: rows, error } = await supabase
    .from('cellar_wines')
    .select('*')
    .in('id', wineIds)
    .is('archived_at', null)
    .eq('is_wishlist', false);
  if (error) throw error;
  const wineById = new Map((rows ?? []).map((w) => [w.id, w as CellarWine]));
  // Stable order within a cell: oldest placement first.
  const ordered = [...placements].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  for (const p of ordered) {
    if (!p.bin_cell_id) continue;
    const w = wineById.get(p.cellar_wine_id);
    if (!w) continue; // archived / wishlist / deleted
    // Keep `quantity` the TRUE whole-cellar total; carry the per-cell count in
    // bin_cell_quantity (what the lattice/cell screen display for this cubby).
    (byCell[p.bin_cell_id] ??= []).push({ ...w, bin_cell_quantity: p.quantity ?? 0, bin_placement_id: p.id });
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

// Take a wine out of a bin cell — the bottles stay in the cellar (loose), the
// cell just loses this wine's placement. Mirrors "remove from location" /
// clearing a rack slot: the wine is never destroyed by leaving its container.
export async function removeWineFromCell(cellarWineId: string, cellId: string): Promise<void> {
  await removeWineFromBinCell(cellarWineId, cellId);
}

// Per-bin total bottle counts (for the Home Storage carousel cards + tally),
// computed in one query. Live wines only.
export async function getBinBottleCounts(binIds: string[]): Promise<Record<string, number>> {
  if (binIds.length === 0) return {};
  const { data: cells, error: cellErr } = await supabase.from('bin_cells').select('id, bin_id').in('bin_id', binIds);
  if (cellErr) throw cellErr;
  const binByCell = new Map((cells ?? []).map((c) => [c.id, c.bin_id as string]));
  const cellIds = (cells ?? []).map((c) => c.id);
  const counts: Record<string, number> = {};
  if (cellIds.length === 0) return counts;
  // Sum 'bin' placement quantities per bin, live wines only (mig 116).
  const { data, error } = await supabase
    .from('cellar_placements')
    .select('quantity, bin_cell_id, wine:cellar_wines!inner(archived_at, is_wishlist)')
    .eq('kind', 'bin')
    .in('bin_cell_id', cellIds)
    .is('wine.archived_at', null)
    .eq('wine.is_wishlist', false);
  if (error) throw error;
  for (const row of (data ?? []) as { quantity: number; bin_cell_id: string }[]) {
    const binId = binByCell.get(row.bin_cell_id);
    if (!binId) continue;
    counts[binId] = (counts[binId] ?? 0) + (row.quantity ?? 0);
  }
  return counts;
}
