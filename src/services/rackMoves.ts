import { supabase } from '../api/supabase';
import { getRackSlots, assignSlots, moveRackSlot, removeSlotsForWine, RackMoveRefused, type SlotPos } from '../api/racks';
import { fetchPlacementsForWine, decrementPlacement, placedCount, addLocationPlacement, addBinPlacement } from '../api/placements';
import { getBinCells } from '../api/bins';
import { updateCellarWine } from '../api/cellar';
import { detectPlacementMismatch, placementWarningBody, expectedSlotSizeMl, bottleSizeLabel } from '../components/BottleSizePicker';
import { showAlert } from '../components/AppAlert';
import { slotKey } from '../utils/rackSlots';
import type { CellarWine, WineRack } from '../types/wine';

// Moving bottles into, out of and around racks and fridges. Every slot write
// goes through src/api/racks (insert-only placement, the move_rack_slot
// transaction), so no path can overwrite a bottle that's already in a slot.

type RackGrid = Pick<WineRack, 'name' | 'rows' | 'cols' | 'storage_type' | 'large_format_cols' | 'large_format_bottle_size_ml'>;

// Every slot position in a unit: the optional large-format band (row -1), then
// the standard grid row by row.
export function allSlots(rack: RackGrid): SlotPos[] {
  const out: SlotPos[] = [];
  for (let col = 0; col < (rack.large_format_cols ?? 0); col++) out.push({ row: -1, col });
  for (let row = 0; row < rack.rows; row++) for (let col = 0; col < rack.cols; col++) out.push({ row, col });
  return out;
}

// The free slots a bottle of this size fits: a slot built for the size or
// larger (the band holds its configured format, the grid 75cl). A unit with no
// slot that size anywhere evidently holds the bottle another way, so then every
// free slot counts — placing still shows the size warning.
export function freeSlotsForSize(rack: RackGrid, occupied: ReadonlySet<string>, bottleMl: number): SlotPos[] {
  const slots = allSlots(rack);
  const fits = (s: SlotPos) => expectedSlotSizeMl(s.row, rack.large_format_bottle_size_ml) >= bottleMl;
  const free = slots.filter((s) => !occupied.has(slotKey(s.row, s.col)));
  return slots.some(fits) ? free.filter(fits) : free;
}

export type RackRoom = { name: string; free: number; bottleMl: number };

// How many bottles of this size a rack or fridge still has room for, read fresh.
export async function rackRoomFor(rackId: string, bottleMl: number): Promise<RackRoom> {
  const { data: rack, error } = await supabase
    .from('wine_racks')
    .select('name, rows, cols, storage_type, large_format_cols, large_format_bottle_size_ml')
    .eq('id', rackId)
    .single();
  if (error) throw error;
  const occupied = new Set((await getRackSlots(rackId))
    .filter((s) => s.cellar_wine_id)
    .map((s) => slotKey(s.row_index, s.col_index)));
  return { name: rack.name, free: freeSlotsForSize(rack, occupied, bottleMl).length, bottleMl };
}

// Before bottles are sent to a rack to wait for a slot: say how many will fit.
// Resolves how many to send (0 = none fit, or the user cancelled). `rest` ends
// "the rest …" — where the bottles that don't fit stay.
export function confirmRackRoom(room: RackRoom, wanted: number, rest = 'stay in Your Full Cellar List'): Promise<number> {
  if (room.free >= wanted) return Promise.resolve(wanted);
  return new Promise((resolve) => {
    if (room.free <= 0) {
      showAlert({
        title: `${room.name} is full`,
        body: `There's no free slot for a ${bottleSizeLabel(room.bottleMl)} bottle in ${room.name}. Nothing has been moved.`,
        dismissable: false,
        buttons: [{ text: 'OK', style: 'cancel', onPress: () => resolve(0) }],
      });
      return;
    }
    showAlert({
      title: 'Not enough room',
      body: `Only ${room.free} of ${wanted} will fit in ${room.name} — the rest ${rest}.`,
      dismissable: false,
      buttons: [
        { text: `Place ${room.free}`, onPress: () => resolve(room.free) },
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(0) },
      ],
    });
  });
}

// The one size check every placement path runs: when the wine's format doesn't
// match a target slot, ask before placing. Resolves true to go ahead.
export function warnIfSizeMismatch(
  wine: Pick<CellarWine, 'bottle_size_ml'>,
  rack: Pick<WineRack, 'large_format_bottle_size_ml'>,
  rows: number[],
): Promise<boolean> {
  const mismatch = [...new Set(rows)]
    .map((row) => detectPlacementMismatch(wine.bottle_size_ml ?? 750, row, rack.large_format_bottle_size_ml))
    .find(Boolean);
  if (!mismatch) return Promise.resolve(true);
  return new Promise((resolve) => {
    showAlert({
      title: 'Bottle size mismatch',
      body: placementWarningBody(mismatch),
      dismissable: false,
      buttons: [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Place anyway', onPress: () => resolve(true) },
      ],
    });
  });
}

// Move a wine's bottles from one rack into chosen slots of another, one bottle
// per transaction (move_rack_slot): a bottle is only ever in its old slot or its
// new one, never neither. Stops at the first refusal and reports it.
export async function moveBottlesBetweenRacks(
  wineId: string, fromRackId: string, toRackId: string, targets: SlotPos[],
): Promise<{ moved: number; refused: Error | null }> {
  const sources = (await getRackSlots(fromRackId))
    .filter((s) => s.cellar_wine_id === wineId)
    .sort((a, b) => (b.row_index - a.row_index) || (b.col_index - a.col_index));
  let moved = 0;
  for (let i = 0; i < targets.length && i < sources.length; i++) {
    const src = sources[i];
    try {
      await moveRackSlot(wineId, { rackId: fromRackId, row: src.row_index, col: src.col_index }, { rackId: toRackId, ...targets[i] }, null);
      moved++;
    } catch (err) {
      if (err instanceof RackMoveRefused) return { moved, refused: err };
      throw err;
    }
  }
  return { moved, refused: null };
}

// Free `n` of a wine's bottles from its alt cellars and bins (not racks), so they
// can go into a rack. Returns how many were freed.
async function releaseFromLocationsAndBins(wineId: string, n: number): Promise<number> {
  let freed = 0;
  for (const p of (await fetchPlacementsForWine(wineId)).filter((x) => x.kind === 'location' || x.kind === 'bin')) {
    if (freed >= n) break;
    freed += await decrementPlacement(p.id, Math.min(n - freed, p.quantity ?? 0));
  }
  return freed;
}

// Move up to `count` bottles of a wine held in an alt cellar or bin into these
// free rack slots. One wine = one Cellar List line: the quantity never changes;
// the bottles are freed from their old place first (so placed never exceeds the
// quantity), then slotted here. Returns how many landed in the rack — any
// shortfall (a slot taken meanwhile) stays in Your Full Cellar List, unplaced.
export async function moveIntoRackFromStorage(wine: CellarWine, count: number, rackId: string, freeSlots: SlotPos[]): Promise<number> {
  const n = Math.min(count, freeSlots.length, wine.quantity ?? 1);
  if (n < 1) return 0;
  await releaseFromLocationsAndBins(wine.id, n);
  const loose = Math.max(0, (wine.quantity ?? 1) - placedCount(await fetchPlacementsForWine(wine.id)));
  const placed = await assignSlots(rackId, freeSlots.slice(0, Math.min(n, loose)), wine.id);
  return placed.length;
}

// Move `n` of THIS rack's bottles of a wine into an alt cellar. Frees only this
// rack's slots (the wine may sit in other units too), then files exactly the
// freed bottles there. Returns how many moved.
export async function moveRackBottlesToLocation(wineId: string, rackId: string, n: number, locationId: string): Promise<number> {
  const freed = await removeSlotsForWine(wineId, n, rackId);
  if (freed > 0) await addLocationPlacement(wineId, locationId, null, freed);
  return freed;
}

// Move `n` of THIS rack's bottles of a wine into a bin: merged into the wine's
// existing cell there, else the first diamond (then any cell) with room. A bin
// with no cells can't hold a placement, so the bottles wait to be placed on the
// bin's own screen. Returns how many moved.
export async function moveRackBottlesToBin(wineId: string, rackId: string, n: number, binId: string): Promise<number> {
  const cells = await getBinCells(binId);
  const freed = await removeSlotsForWine(wineId, n, rackId);
  if (freed <= 0) return 0;
  if (cells.length === 0) {
    await updateCellarWine(wineId, { awaiting_placement: true, awaiting_placement_unit_id: binId });
    return freed;
  }
  const room = (c: (typeof cells)[number]) => (c.capacity ?? 0) - (c.bottleCount ?? 0);
  const cell = cells.find((c) => (c.wines ?? []).some((w) => w.id === wineId))
    ?? cells.find((c) => c.kind === 'diamond' && room(c) >= freed)
    ?? cells.find((c) => room(c) >= freed)
    ?? cells.find((c) => room(c) > 0)
    ?? cells[0];
  await addBinPlacement(wineId, cell.id, freed);
  return freed;
}
