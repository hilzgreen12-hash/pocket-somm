import { supabase } from '../api/supabase';
import { deleteRack, getSlotAssignments } from '../api/racks';
import { fetchPlacementsForWines, trimOrDeleteWineOnUnitDelete } from '../api/placements';
import { selectAllInChunks } from '../api/paging';
import { reviewsOn } from '../utils/confirmWineDelete';
import type { CellarWine } from '../types/wine';

export type RackContents = {
  bottles: number;
  wines: number;
  // Reviews on wines that live ONLY in this rack — deleting the rack's contents
  // deletes those wines, and their reviews with them.
  reviewsLost: number;
  countByWine: Map<string, number>;
};

// What "Delete Rack & Contents" would remove: the bottles in the rack, how many
// wines they are, and the reviews that go with wines kept nowhere else (the
// same rule as trimOrDeleteWineOnUnitDelete).
export async function summariseRackContents(rackId: string): Promise<RackContents> {
  const countByWine = new Map<string, number>();
  for (const s of await getSlotAssignments([rackId])) countByWine.set(s.cellar_wine_id, (countByWine.get(s.cellar_wine_id) ?? 0) + 1);
  const ids = [...countByWine.keys()];
  const [rows, placements] = await Promise.all([
    selectAllInChunks<CellarWine>(ids, (chunk, from, to) =>
      supabase.from('cellar_wines').select('*').in('id', chunk).order('id', { ascending: true }).range(from, to) as any),
    fetchPlacementsForWines(ids),
  ]);
  const elsewhere = new Map<string, number>();
  for (const p of placements) {
    if (p.kind === 'rack' && p.rack_id === rackId) continue;
    elsewhere.set(p.cellar_wine_id, (elsewhere.get(p.cellar_wine_id) ?? 0) + (p.quantity ?? 0));
  }
  const goneEntirely = rows.filter((w) => (elsewhere.get(w.id) ?? 0) <= 0 && (countByWine.get(w.id) ?? 0) >= (w.quantity ?? 0));
  let bottles = 0;
  for (const n of countByWine.values()) bottles += n;
  return { bottles, wines: ids.length, reviewsLost: reviewsOn(goneEntirely), countByWine };
}

// Delete the rack (its slots cascade), then remove the bottles it held: a wine
// that lived only there is deleted, one that also lives elsewhere just loses
// the bottles that were in the rack.
export async function deleteRackWithContents(rackId: string, contents: RackContents): Promise<void> {
  await deleteRack(rackId);
  for (const [wineId, count] of contents.countByWine) await trimOrDeleteWineOnUnitDelete(wineId, count);
}
