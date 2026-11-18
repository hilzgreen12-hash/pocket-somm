import { supabase } from '../api/supabase';
import { deleteBin, getBinOfCell } from '../api/bins';
import {
  fetchBinPlacementsForCells, fetchPlacementsForWines, trimOrDeleteWineOnUnitDelete,
  fetchLocationWines, goesWithLocation, type LocationWine,
} from '../api/placements';
import { selectAllInChunks } from '../api/paging';
import { reviewsOn } from '../utils/confirmWineDelete';
import type { CellarWine } from '../types/wine';

// What "Delete … & Contents" would remove from a bin or an alt cellar: the
// bottles, how many wines they are, and the reviews on wines kept nowhere else
// (deleting a wine deletes its reviews). Racks and fridges: see rackContents.
export type UnitContents = { bottles: number; wines: number; reviewsLost: number };

export type BinContents = UnitContents & { countByWine: Map<string, number> };

export async function summariseBinContents(binId: string): Promise<BinContents> {
  const cellIds = new Set((await getBinOfCell([binId])).keys());
  const inBin = new Map<string, number>();
  for (const p of await fetchBinPlacementsForCells([...cellIds])) {
    inBin.set(p.cellar_wine_id, (inBin.get(p.cellar_wine_id) ?? 0) + (p.quantity ?? 0));
  }
  const ids = [...inBin.keys()];
  const [rows, placements] = await Promise.all([
    selectAllInChunks<CellarWine>(ids, (chunk, from, to) =>
      supabase.from('cellar_wines').select('*').in('id', chunk).is('archived_at', null)
        .order('id', { ascending: true }).range(from, to) as any),
    fetchPlacementsForWines(ids),
  ]);
  const elsewhere = new Map<string, number>();
  for (const p of placements) {
    if (p.kind === 'bin' && p.bin_cell_id && cellIds.has(p.bin_cell_id)) continue;
    elsewhere.set(p.cellar_wine_id, (elsewhere.get(p.cellar_wine_id) ?? 0) + (p.quantity ?? 0));
  }
  // An archived wine's stray placement isn't a bottle in the bin.
  const countByWine = new Map(rows.map((w) => [w.id, inBin.get(w.id) ?? 0]));
  const goneEntirely = rows.filter((w) => (elsewhere.get(w.id) ?? 0) <= 0 && (countByWine.get(w.id) ?? 0) >= (w.quantity ?? 0));
  let bottles = 0;
  for (const n of countByWine.values()) bottles += n;
  return { bottles, wines: rows.length, reviewsLost: reviewsOn(goneEntirely), countByWine };
}

// Delete the bin (its cells and their placements cascade), then remove the
// bottles it held: a wine that lived only there is deleted, one that also lives
// elsewhere just loses the bottles that were in the bin.
export async function deleteBinWithContents(binId: string, contents: BinContents): Promise<void> {
  await deleteBin(binId);
  for (const [wineId, count] of contents.countByWine) await trimOrDeleteWineOnUnitDelete(wineId, count);
}

export type LocationContents = UnitContents & { list: LocationWine[] };

// Pass `list` on to deleteLocationAndWines so the delete acts on what was shown.
export async function summariseLocationContents(locationId: string): Promise<LocationContents> {
  const list = await fetchLocationWines(locationId);
  return {
    bottles: list.reduce((n, w) => n + w.here, 0),
    wines: list.length,
    reviewsLost: reviewsOn(list.filter(goesWithLocation).map((w) => w.row)),
    list,
  };
}
