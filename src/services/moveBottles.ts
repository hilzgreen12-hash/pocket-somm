import { removeSlotsForWine } from '../api/racks';
import { fetchPlacementsForWine, decrementPlacement } from '../api/placements';

// Free `n` bottles of a wine from HOME storage only: rack/fridge slots first,
// then bin cells and home alt cellars. External (offsite) cellars are never
// touched by a move: that stock isn't to hand. Returns how many were freed.
// Shared by the Cellar Quick Command and the wine card's Move Bottles.
export async function releaseHomeBottles(wineId: string, n: number, externalIds: Set<string>): Promise<number> {
  if (n <= 0) return 0;
  let freed = await removeSlotsForWine(wineId, n);
  if (freed >= n) return freed;
  const rest = (await fetchPlacementsForWine(wineId)).filter((p) =>
    p.kind === 'bin' || (p.kind === 'location' && !(p.storage_location_id && externalIds.has(p.storage_location_id))));
  for (const p of rest) {
    if (freed >= n) break;
    const take = Math.min(n - freed, p.quantity ?? 0);
    if (take > 0) { await decrementPlacement(p.id, take); freed += take; }
  }
  return freed;
}
