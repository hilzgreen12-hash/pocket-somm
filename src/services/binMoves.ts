import { assertCanEditCellar } from '../api/cellarContext';
import { removeSlotsForWine } from '../api/racks';
import { addCellarWine, findCellarWineByIdentity, getCellarWineById, updateCellarWine } from '../api/cellar';
import {
  addBinPlacement, decrementPlacement, fetchExternalLocationIds, fetchPlacementsForWine, placedCount,
  releaseFromBinCell, removeWineFromBinCell, type CellarPlacement,
} from '../api/placements';
import { showAlert } from '../components/AppAlert';
import type { BinCell, CellarWine } from '../types/wine';

// Moving bottles into and around a wine bin. A wine's bottles in a cell are one
// 'bin' placement. Bottles are always freed from where they were before they're
// added to a cell, so a wine never has more bottles placed than it holds.

export function binCellNoun(kind: BinCell['kind']): string {
  return kind === 'triangle' ? 'half diamond' : 'diamond';
}

// Cells get over-stuffed in real life, so going over capacity is allowed — but
// asked first. Resolves true to go ahead. `verb` names the action, e.g. 'Save'.
export function confirmCellCapacity(cell: Pick<BinCell, 'kind' | 'capacity'>, total: number, verb: string): Promise<boolean> {
  if (total <= cell.capacity) return Promise.resolve(true);
  return new Promise((resolve) => {
    showAlert({
      title: 'Over capacity',
      body: `This ${binCellNoun(cell.kind)} holds ${cell.capacity}. That would put ${total} bottles in it. ${verb} anyway?`,
      dismissable: false,
      buttons: [
        { text: `${verb} anyway`, onPress: () => resolve(true) },
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      ],
    });
  });
}

// Move up to `count` of a wine's bottles that aren't already in this cell into
// it. They're taken from its other bin cells first, then its other home storage
// (racks and fridges, home alt cellars), then its loose bottles, and an
// external cellar only last. Returns how many landed in the cell.
export async function moveBottlesToBinCell(wineId: string, cellId: string, count: number): Promise<number> {
  assertCanEditCellar();
  const wine = await getCellarWineById(wineId);
  if (!wine || wine.archived_at) return 0;
  const placements = await fetchPlacementsForWine(wineId);
  const inCell = (p: CellarPlacement) => p.kind === 'bin' && p.bin_cell_id === cellId;
  const n = Math.min(count, wine.quantity - placedCount(placements.filter(inCell)));
  if (n <= 0) return 0;
  // Loose = bottles with no placement, counted before anything is freed.
  const loose = Math.max(0, wine.quantity - placedCount(placements));
  const external = await fetchExternalLocationIds(placements.map((p) => p.storage_location_id));
  const isExternal = (p: CellarPlacement) => p.kind === 'location' && !!p.storage_location_id && external.has(p.storage_location_id);

  let need = n;
  const take = async (list: CellarPlacement[]) => {
    for (const p of list) {
      if (need <= 0) return;
      need -= await decrementPlacement(p.id, Math.min(need, p.quantity ?? 0));
    }
  };
  await take(placements.filter((p) => p.kind === 'bin' && !inCell(p)));
  if (need > 0) need -= await removeSlotsForWine(wineId, need);
  await take(placements.filter((p) => p.kind === 'location' && !isExternal(p)));
  need -= Math.min(need, loose);
  await take(placements.filter(isExternal));

  const moved = n - need;
  if (moved > 0) await addBinPlacement(wineId, cellId, moved);
  return moved;
}

// Move `n` of a wine's bottles from one cell to another: freed first, then
// exactly the bottles freed are added, so a failure halfway leaves them loose
// rather than counted twice. Returns how many moved.
export async function moveBetweenBinCells(wineId: string, fromCellId: string, toCellId: string, n: number): Promise<number> {
  const freed = await releaseFromBinCell(wineId, fromCellId, n);
  if (freed > 0) await addBinPlacement(wineId, toCellId, freed);
  return freed;
}

// File a wine's loose bottles (moved to this bin, waiting for a cell) into a
// cell, and clear its waiting flag. Returns how many were filed — 0 when they
// have all been placed somewhere already.
export async function fileLooseBottlesInCell(wineId: string, cellId: string): Promise<number> {
  const wine = await getCellarWineById(wineId);
  if (!wine || wine.archived_at) return 0;
  const loose = wine.quantity - placedCount(await fetchPlacementsForWine(wineId));
  if (loose > 0) await addBinPlacement(wineId, cellId, loose);
  await updateCellarWine(wineId, { awaiting_placement: false, awaiting_placement_unit_id: null });
  return Math.max(0, loose);
}

// The fields a new cellar line copies from the line it's split from: what the
// wine is and what's known about it. Not its reviews, notes or favourites —
// those stay with the line they were written on.
const LINE_FIELDS = [
  'wine_name', 'producer', 'region', 'vintage', 'style', 'grape_variety', 'is_spirit',
  'date_received', 'critic_score', 'critic_score_note', 'drinking_window_from', 'drinking_window_to',
  'drinking_window_status', 'user_drinking_window', 'tasting_notes', 'insider_note', 'serving_suggestion',
  'market_vintage_note', 'wine_knowledge', 'wine_knowledge_at', 'label_image_path', 'label_image_fetched',
  'purchase_price', 'purchase_price_currency', 'purchase_price_estimated', 'purchase_price_at',
  'estimated_value', 'estimated_value_currency', 'estimated_value_at', 'estimated_value_low',
  'estimated_value_high', 'estimated_value_source', 'estimated_value_scope', 'ws_wine_id', 'ws_wine_name',
  'added_via',
] as const satisfies readonly (keyof CellarWine)[];

// Change the bottle size of the bottles in one cell. A cellar line has one
// size, so when every bottle of the wine is in this cell the line simply
// changes. Otherwise this cell's bottles become their own line in the new size
// (joining the wine's existing line in that size, if there is one) and the
// rest of the wine keeps its size. Returns 'split' when this cell's bottles
// moved to another line.
export async function setCellBottleSize(userId: string, wineId: string, cellId: string, sizeMl: number): Promise<'changed' | 'split' | null> {
  const wine = await getCellarWineById(wineId);
  if (!wine || wine.archived_at) throw new Error('This wine is no longer in your cellar. Pull to refresh and try again.');
  if ((wine.bottle_size_ml ?? 750) === sizeMl) return null;
  const inCell = placedCount((await fetchPlacementsForWine(wineId)).filter((p) => p.kind === 'bin' && p.bin_cell_id === cellId));
  if (inCell >= wine.quantity) {
    await updateCellarWine(wineId, { bottle_size_ml: sizeMl });
    return 'changed';
  }
  if (inCell <= 0) return null;
  // The new line's count goes up before its placement lands, and the old line's
  // placement goes before its count comes down — so neither ever has more
  // bottles placed than it holds, and the quantity trigger (migration 107)
  // never trims an alt-cellar placement.
  const twin = await findCellarWineByIdentity(userId, wine, sizeMl);
  let lineId: string;
  if (twin) {
    await updateCellarWine(twin.id, { quantity: twin.quantity + inCell });
    lineId = twin.id;
  } else {
    // Unset fields are left out, so the database defaults apply.
    const copy = Object.fromEntries(LINE_FIELDS.filter((k) => wine[k] != null).map((k) => [k, wine[k]])) as Partial<CellarWine>;
    lineId = (await addCellarWine({ ...copy, user_id: userId, wine_name: wine.wine_name, quantity: inCell, bottle_size_ml: sizeMl })).id;
  }
  await addBinPlacement(lineId, cellId, inCell);
  await removeWineFromBinCell(wineId, cellId);
  await updateCellarWine(wineId, { quantity: wine.quantity - inCell });
  return 'split';
}
