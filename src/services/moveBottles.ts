import { removeSlotsForWine } from '../api/racks';
import { getBinOfCell } from '../api/bins';
import { updateCellarWine } from '../api/cellar';
import {
  fetchPlacementsForWine, decrementPlacement, placedCount, releaseBottlesFromPlacements, releaseFromUnit,
  addLocationPlacement, type CellarPlacement, type StorageUnitRef,
} from '../api/placements';

// Free `n` bottles of a wine from HOME storage only: the unit the action started
// from (if any), then rack/fridge slots, then bin cells and home alt cellars.
// External (offsite) cellars are never touched by a move: that stock isn't to
// hand. Returns how many were freed. Shared by the Cellar Quick Command and the
// wine card's Move Bottles.
export async function releaseHomeBottles(wineId: string, n: number, externalIds: Set<string>, fromUnit?: StorageUnitRef): Promise<number> {
  if (n <= 0) return 0;
  let freed = fromUnit && !(fromUnit.kind === 'location' && externalIds.has(fromUnit.id))
    ? await releaseFromUnit(wineId, fromUnit, n)
    : 0;
  if (freed < n) freed += await removeSlotsForWine(wineId, n - freed);
  if (freed >= n) return freed;
  const rest = (await fetchPlacementsForWine(wineId)).filter((p) =>
    p.kind === 'bin' || (p.kind === 'location' && !(p.storage_location_id && externalIds.has(p.storage_location_id))));
  for (const p of rest) {
    if (freed >= n) break;
    freed += await decrementPlacement(p.id, Math.min(n - freed, p.quantity ?? 0));
  }
  return freed;
}

// Get `n` of a wine's bottles ready to go into a rack, fridge or bin (`dest`):
// its loose bottles are used first, then bottles are freed from its OTHER home
// storage — never from `dest` itself (they're already there) and never from an
// external cellar. Returns how many bottles are now loose for `dest`.
export async function loosenBottlesFor(
  wineId: string, quantity: number, n: number, externalIds: Set<string>, dest: StorageUnitRef,
): Promise<number> {
  const placements = await fetchPlacementsForWine(wineId);
  const loose = Math.max(0, quantity - placedCount(placements));
  let need = n - loose;
  if (need <= 0) return n;
  const destCells = dest.kind === 'bin' ? new Set((await getBinOfCell([dest.id])).keys()) : new Set<string>();
  // Racks and fridges free through their slots (one per bottle), others through
  // their placements.
  const otherRacks = new Set(placements
    .filter((p) => p.kind === 'rack' && p.rack_id && !(dest.kind === 'rack' && p.rack_id === dest.id))
    .map((p) => p.rack_id as string));
  for (const rackId of otherRacks) {
    if (need <= 0) break;
    need -= await removeSlotsForWine(wineId, need, rackId);
  }
  const others = placements.filter((p) =>
    (p.kind === 'bin' && !(p.bin_cell_id && destCells.has(p.bin_cell_id)))
    || (p.kind === 'location' && !(p.storage_location_id && externalIds.has(p.storage_location_id))));
  for (const p of others) {
    if (need <= 0) break;
    need -= await decrementPlacement(p.id, Math.min(need, p.quantity ?? 0));
  }
  return n - Math.max(0, need);
}

// Free the storage of `n` bottles that are LEAVING the cellar (archived or
// deleted) out of a wine holding `quantity` bottles. Call it BEFORE lowering the
// quantity: the quantity update fires the mig-107 trim, which would otherwise
// cut alt-cellar placements newest-first — often not the bottles that left.
// Bottles come from `fromUnit` first (the screen the action started on), then
// loose stock, then placements (see releaseBottlesFromPlacements: Home Storage
// before external). Bottles a caller has already freed count as loose, so a
// screen can free its own spot first (a tapped rack slot, a bin cell) and pass
// no unit.
export async function releaseLeavingBottles(wineId: string, quantity: number, n: number, fromUnit?: StorageUnitRef): Promise<void> {
  if (n <= 0) return;
  // Loose = bottles with no placement, counted BEFORE anything is freed (freed
  // bottles become loose too, and must not be counted twice).
  const loose = Math.max(0, quantity - placedCount(await fetchPlacementsForWine(wineId)));
  const remaining = n - (fromUnit ? await releaseFromUnit(wineId, fromUnit, n) : 0);
  const toFree = Math.max(0, remaining - loose);
  if (toFree > 0) await releaseBottlesFromPlacements(wineId, toFree);
}

// Where bottles coming home can go: Your Cellar List (unplaced), a rack or
// fridge, a bin, or a home alt cellar. Never an external cellar — storage only
// ever moves external → home.
export type HomeDestination =
  | { kind: 'list' }
  | { kind: 'rack' | 'bin' | 'location'; id: string; name: string };

// Move to Home Storage: bring `n` of a wine's bottles out of its external
// cellar(s). An alt cellar takes them straight away; a bin gets them flagged
// awaiting placement; for a rack/fridge or Your Cellar List they're left loose
// (the rack's own screen places them). Returns how many actually moved.
export async function moveExternalBottlesHome(
  wineId: string, n: number, externalPlacements: CellarPlacement[], dest: HomeDestination,
): Promise<number> {
  let moved = 0;
  for (const p of externalPlacements) {
    if (moved >= n) break;
    moved += await decrementPlacement(p.id, Math.min(n - moved, p.quantity ?? 0));
  }
  if (moved === 0) return 0;
  if (dest.kind === 'location') await addLocationPlacement(wineId, dest.id, null, moved);
  if (dest.kind === 'bin') await updateCellarWine(wineId, { awaiting_placement: true, awaiting_placement_unit_id: dest.id });
  return moved;
}
