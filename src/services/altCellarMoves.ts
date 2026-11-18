import { clearWineFromRacks } from '../api/racks';
import { deleteCellarWine, getCellarWineById, updateCellarWine } from '../api/cellar';
import {
  addLocationPlacement, decrementPlacement, releaseFromLocation, setPlacementCase, type LocationWineRow,
} from '../api/placements';
import { archiveBottles } from './archiveNight';
import { releaseLeavingBottles } from './moveBottles';
import { fileLocationBottlesIntoCase } from '../components/PackagingPrompt';

// The writes behind an alt cellar's screen. Each list row is one placement (a
// wine's bottles here, loose or in one case), so an action on a row takes its
// bottles from that placement first.

const GONE = 'Those bottles are no longer in this cellar — pull to refresh and try again.';

// Free `count` of a row's bottles here — from its own placement when known —
// and say so when there was nothing left to free, rather than reporting a move
// that didn't happen. Returns how many were freed.
async function releaseRow(row: LocationWineRow, locationId: string, count: number): Promise<number> {
  const freed = row.placement_id
    ? await decrementPlacement(row.placement_id, count)
    : await releaseFromLocation(row.id, locationId, count);
  if (freed === 0) throw new Error(GONE);
  return freed;
}

// "Move to Cellar List": the bottles stay on the same line, just unplaced.
export async function moveRowToCellarList(row: LocationWineRow, locationId: string, count: number): Promise<number> {
  return releaseRow(row, locationId, count);
}

// Move bottles to another home alt cellar: freed here first, then exactly the
// bottles freed land there, so a failure halfway leaves them loose rather than
// counted twice.
export async function moveRowToAltCellar(row: LocationWineRow, locationId: string, toLocationId: string, count: number): Promise<number> {
  const freed = await releaseRow(row, locationId, count);
  await addLocationPlacement(row.id, toLocationId, null, freed);
  return freed;
}

// Bottles bound for a rack or fridge are freed here first and wait, loose on
// the same line, for the rack's own screen to slot them.
export async function releaseRowForRack(row: LocationWineRow, locationId: string, count: number): Promise<number> {
  return releaseRow(row, locationId, count);
}

// Permanently delete `n` of a wine's bottles, this row's first. The list shows
// only the bottles here, so the wine's real total decides whether it goes
// entirely. Its bottles here are freed before the count drops: the quantity
// trigger (migration 107) trims alt-cellar placements newest first, which
// could otherwise take them from another cellar.
export async function deleteRowBottles(row: LocationWineRow, locationId: string, n: number): Promise<void> {
  if (n <= 0) return;
  const real = await getCellarWineById(row.id);
  if (!real || real.archived_at) return;
  if (n >= real.quantity) {
    await clearWineFromRacks(row.id);
    await deleteCellarWine(row.id);
    return;
  }
  if (row.placement_id) await decrementPlacement(row.placement_id, n);
  await releaseLeavingBottles(row.id, real.quantity, n, row.placement_id ? undefined : { kind: 'location', id: locationId });
  await updateCellarWine(row.id, { quantity: real.quantity - n });
}

// Archive bottles of a wine, this cellar's first.
export async function archiveFromAltCellar(wineId: string, locationId: string, count: number, date: string, note?: string): Promise<void> {
  const { archived } = await archiveBottles(wineId, count, date, { fromUnit: { kind: 'location', id: locationId }, note });
  if (archived === 0) throw new Error('This wine is no longer in your cellar. Pull to refresh and try again.');
}

// File a row's bottles into a case, or out of one with null.
export async function fileRowIntoCase(row: LocationWineRow, locationId: string, caseId: string | null): Promise<void> {
  if (row.placement_id) await setPlacementCase(row.placement_id, caseId);
  else await fileLocationBottlesIntoCase({ wineId: row.id, locationId, caseId });
}

// File `n` of a row's bottles into a case: all of them just re-case the
// placement; fewer split it (freed from the row, then exactly those added to
// the case's placement).
export async function moveRowBottlesIntoCase(row: LocationWineRow, locationId: string, caseId: string, n: number): Promise<void> {
  if (n >= (row.quantity ?? 1)) {
    await fileRowIntoCase(row, locationId, caseId);
    return;
  }
  const freed = await releaseRow(row, locationId, n);
  await addLocationPlacement(row.id, locationId, caseId, freed);
}
