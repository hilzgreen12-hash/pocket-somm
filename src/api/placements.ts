import { supabase } from './supabase';
import { cellarOwner, canEditCellar, assertCanEditCellar, refusedWriteError } from './cellarContext';
import { removeSlotsForWine } from './racks';
import { deleteStorageLocation } from './storageLocations';
import { deleteCellarWine } from './cellar';
import { selectAllPages, selectAllInChunks, chunkIds } from './paging';
import type { CellarWine } from '../types/wine';

// A single placement of some of a wine's bottles in ONE spot — a rack slot, a
// bin cell, or an alt cellar (optionally in a case). The one record of where a
// bottle is (migration 103). Rack placements are mirrored from rack_slots by a
// trigger; bin and alt-cellar placements are written by the app (migrations
// 106 and 116). The legacy cellar_wines pointers are retired (migration 139).
export interface CellarPlacement {
  id: string;
  cellar_wine_id: string;
  kind: 'rack' | 'bin' | 'location';
  quantity: number;
  rack_id: string | null;
  row_index: number | null;
  col_index: number | null;
  bin_cell_id: string | null;
  storage_location_id: string | null;
  case_id: string | null;
}

const COLS =
  'id, cellar_wine_id, kind, quantity, rack_id, row_index, col_index, bin_cell_id, storage_location_id, case_id';

// All placements for one wine (its full bottle-distribution across storage).
// Paged: rack placements are one row per bottle, so even one wine can in theory
// exceed PostgREST's 1000-row cap.
export async function fetchPlacementsForWine(wineId: string): Promise<CellarPlacement[]> {
  return selectAllPages<CellarPlacement>((from, to) =>
    supabase.from('cellar_placements').select(COLS)
      .eq('cellar_wine_id', wineId)
      .order('id', { ascending: true })
      .range(from, to) as any);
}

// Placements for many wines at once (batched — for list/stats screens). Chunked
// so a big cellar doesn't blow the `in (...)` URL limit, and PAGED within each
// chunk — rack placements are one row per bottle, so 300 wines can easily hold
// more than PostgREST's 1000-row cap.
export async function fetchPlacementsForWines(wineIds: string[]): Promise<CellarPlacement[]> {
  return selectAllInChunks<CellarPlacement>(wineIds, (chunk, from, to) =>
    supabase.from('cellar_placements').select(COLS)
      .in('cellar_wine_id', chunk)
      .order('id', { ascending: true })
      .range(from, to) as any);
}

async function fetchPlacementsForLocation(locationId: string): Promise<CellarPlacement[]> {
  return selectAllPages<CellarPlacement>((from, to) =>
    supabase.from('cellar_placements').select(COLS)
      .eq('storage_location_id', locationId)
      .order('id', { ascending: true })
      .range(from, to) as any);
}

// Bottles of a wine that are placed somewhere (sum of placement quantities). The
// rest of the wine's `quantity` is "unplaced" (loose in the Full Cellar List).
export function placedCount(placements: CellarPlacement[]): number {
  return placements.reduce((sum, p) => sum + (p.quantity ?? 0), 0);
}

// ---- App-managed 'location' (alt cellar) placements (Phase 3) --------------

// Add `quantity` bottles of a wine to an alt cellar (optionally boxed in a case),
// merging into an existing matching placement rather than spawning a duplicate.
export async function addLocationPlacement(
  wineId: string, locationId: string, caseId: string | null, quantity: number,
): Promise<void> {
  let q = supabase
    .from('cellar_placements')
    .select('id, quantity')
    .eq('cellar_wine_id', wineId)
    .eq('kind', 'location')
    .eq('storage_location_id', locationId);
  q = caseId ? q.eq('case_id', caseId) : q.is('case_id', null);
  const { data: existing, error: selErr } = await q.limit(1).maybeSingle();
  if (selErr) throw selErr;
  if (existing) {
    const { data: changed, error } = await supabase
      .from('cellar_placements')
      .update({ quantity: (existing.quantity ?? 0) + quantity })
      .eq('id', existing.id)
      .select('id');
    if (error) throw error;
    if (!changed?.length) throw refusedWriteError();
  } else {
    const { error } = await supabase.from('cellar_placements').insert({
      cellar_wine_id: wineId, kind: 'location', quantity, storage_location_id: locationId, case_id: caseId,
    });
    if (error) throw error;
  }
}

// File many wines into alt cellars in one write — for wines that have no
// placement there yet (a cellar import's new lines), so nothing needs merging.
export async function insertLocationPlacements(
  rows: { wineId: string; locationId: string; caseId: string | null; quantity: number }[],
): Promise<void> {
  if (!rows.length) return;
  const { error } = await supabase.from('cellar_placements').insert(rows.map((r) => ({
    cellar_wine_id: r.wineId, kind: 'location', quantity: r.quantity, storage_location_id: r.locationId, case_id: r.caseId,
  })));
  if (error) throw error;
}

// ---- App-managed 'bin' placements (Phase 4, mig 116) -----------------------

// Add `quantity` bottles of a wine to ONE bin cell, merging into an existing
// (wine, cell) bin placement rather than spawning a duplicate.
export async function addBinPlacement(wineId: string, cellId: string, quantity: number): Promise<void> {
  assertCanEditCellar();
  const { data: existing, error: selErr } = await supabase
    .from('cellar_placements')
    .select('id, quantity')
    .eq('cellar_wine_id', wineId)
    .eq('kind', 'bin')
    .eq('bin_cell_id', cellId)
    .limit(1)
    .maybeSingle();
  if (selErr) throw selErr;
  if (existing) {
    const { data: changed, error } = await supabase
      .from('cellar_placements')
      .update({ quantity: (existing.quantity ?? 0) + quantity })
      .eq('id', existing.id)
      .select('id');
    if (error) throw error;
    if (!changed?.length) throw refusedWriteError();
  } else {
    const { error } = await supabase.from('cellar_placements').insert({
      cellar_wine_id: wineId, kind: 'bin', quantity, bin_cell_id: cellId,
    });
    if (error) throw error;
  }
}

// A storage tile's collage item: the wine's own label photo, or (no photo) its
// identity so the tile can show a web-found label.
export type LocationCollageItem = string | { producer: string | null; wineName: string | null };
type CollageMap = Record<string, LocationCollageItem[]>;

// Newest placements read per unit: enough to find four different wines unless
// one wine fills a rack's newest slots.
const COLLAGE_ROWS = 24;

// Up to four different live wines per home-storage unit, newest placement
// first, for the Cellar tab's collage tiles. One small query per unit, so a
// large external import (never shown there) isn't read at all.
export async function fetchLatestLocationThumbs(units: { rackIds: string[]; binIds: string[]; locationIds: string[] }): Promise<{
  rack: CollageMap; bin: CollageMap; location: CollageMap;
}> {
  const newest = async (filter: (q: any) => any): Promise<any[]> => {
    const { data, error } = await filter(supabase.from('cellar_placements')
      .select('id, created_at, wine:cellar_wines!inner(id, producer, wine_name, label_image_path, archived_at)'))
      .is('wine.archived_at', null)
      .order('created_at', { ascending: false })
      .order('id', { ascending: true })
      .limit(COLLAGE_ROWS);
    if (error) throw error;
    return data ?? [];
  };
  const collage = (rows: any[]): LocationCollageItem[] => {
    const seen = new Set<string>();
    const out: LocationCollageItem[] = [];
    for (const { wine: w } of rows) {
      if (out.length >= 4 || seen.has(w.id) || (!w.label_image_path && !w.producer && !w.wine_name)) continue;
      seen.add(w.id);
      out.push(w.label_image_path || { producer: w.producer ?? null, wineName: w.wine_name ?? null });
    }
    return out;
  };
  const cellsByBin = new Map<string, string[]>();
  const cells = await selectAllInChunks<{ id: string; bin_id: string }>(units.binIds, (chunk, from, to) =>
    supabase.from('bin_cells').select('id, bin_id').in('bin_id', chunk)
      .order('id', { ascending: true }).range(from, to) as any);
  for (const c of cells) cellsByBin.set(c.bin_id, [...(cellsByBin.get(c.bin_id) ?? []), c.id]);

  const tiles = async (ids: string[], filter: (id: string) => (q: any) => any): Promise<CollageMap> => {
    const lists = await Promise.all(ids.map((id) => newest(filter(id))));
    return Object.fromEntries(ids.map((id, i) => [id, collage(lists[i])]));
  };
  const [rack, bin, location] = await Promise.all([
    tiles(units.rackIds, (id) => (q) => q.eq('kind', 'rack').eq('rack_id', id)),
    tiles(units.binIds.filter((id) => cellsByBin.has(id)), (id) => (q) => q.eq('kind', 'bin').in('bin_cell_id', cellsByBin.get(id)!)),
    tiles(units.locationIds, (id) => (q) => q.eq('kind', 'location').eq('storage_location_id', id)),
  ]);
  return { rack, bin, location };
}

// Every bin placement sitting in any of these cells — for the lattice/cell reads.
export async function fetchBinPlacementsForCells(cellIds: string[]): Promise<CellarPlacement[]> {
  if (cellIds.length === 0) return [];
  return selectAllInChunks<CellarPlacement>(cellIds, (chunk, from, to) =>
    supabase.from('cellar_placements').select(COLS)
      .eq('kind', 'bin')
      .in('bin_cell_id', chunk)
      .order('id', { ascending: true })
      .range(from, to) as any);
}

// Free `n` bottles of a wine from ONE specific bin cell (the moved/removed bottles
// become loose unless the caller re-places them). Scoped to that cell only.
export async function releaseFromBinCell(wineId: string, cellId: string, n: number): Promise<number> {
  if (n <= 0) return 0;
  let toFree = n;
  let freed = 0;
  const bins = (await fetchPlacementsForWine(wineId)).filter(
    (p) => p.kind === 'bin' && p.bin_cell_id === cellId,
  );
  for (const p of bins) {
    if (toFree <= 0) break;
    const removed = await decrementPlacement(p.id, Math.min(toFree, p.quantity ?? 0));
    toFree -= removed;
    freed += removed;
  }
  return freed;
}

// Delete every bin placement in a set of cells (empty cell / empty bin). The
// wines survive loose (their quantity is untouched — only the cell membership
// goes). An empty cell legitimately deletes nothing, so only the access check
// can tell a refused write apart here.
export async function clearBinCellPlacements(cellIds: string[]): Promise<void> {
  assertCanEditCellar();
  for (const chunk of chunkIds(cellIds)) {
    const { error } = await supabase
      .from('cellar_placements')
      .delete()
      .eq('kind', 'bin')
      .in('bin_cell_id', chunk);
    if (error) throw error;
  }
}

// Remove ONE wine's placement from ONE cell entirely (the row's bottles stay in
// the cellar, loose). Mirrors "remove from location".
export async function removeWineFromBinCell(wineId: string, cellId: string): Promise<void> {
  assertCanEditCellar();
  const { data, error } = await supabase
    .from('cellar_placements')
    .delete()
    .eq('kind', 'bin')
    .eq('cellar_wine_id', wineId)
    .eq('bin_cell_id', cellId)
    .select('id');
  if (error) throw error;
  if (!data?.length) throw refusedWriteError();
}

// Free `n` bottles of a wine FROM wherever they're stored: rack/fridge slots,
// then bin cells, then home alt cellars, and external (offsite) cellars last —
// a bottle that leaves the cellar is far likelier to have come from home. Use
// when bottles leave the active cellar (archive / removal) so a placement count
// (e.g. "3 bottles in Large Wine Rack") never lingers above the wine's real
// quantity. Returns how many bottles were actually freed.
export async function releaseBottlesFromPlacements(wineId: string, n: number): Promise<number> {
  if (n <= 0) return 0;
  let freed = await removeSlotsForWine(wineId, n);
  if (freed >= n) return freed;
  const rest = (await fetchPlacementsForWine(wineId)).filter((p) => p.kind === 'location' || p.kind === 'bin');
  const external = await fetchExternalLocationIds(rest.map((p) => p.storage_location_id));
  const order = (p: CellarPlacement) =>
    (p.kind === 'bin' ? 0 : p.storage_location_id && external.has(p.storage_location_id) ? 2 : 1);
  for (const p of [...rest].sort((a, b) => order(a) - order(b))) {
    if (freed >= n) break;
    freed += await decrementPlacement(p.id, Math.min(n - freed, p.quantity ?? 0));
  }
  return freed;
}

// Free `n` bottles from ONE specific alt-cellar location (used when the user chooses,
// on archive, which physical place a bottle comes from). Scoped to that location's
// placements only — never touches racks or other locations.
export async function releaseFromLocation(wineId: string, locationId: string, n: number): Promise<number> {
  if (n <= 0) return 0;
  let toFree = n;
  let freed = 0;
  const locs = (await fetchPlacementsForWine(wineId)).filter(
    (p) => p.kind === 'location' && p.storage_location_id === locationId,
  );
  for (const p of locs) {
    if (toFree <= 0) break;
    const removed = await decrementPlacement(p.id, Math.min(toFree, p.quantity ?? 0));
    toFree -= removed;
    freed += removed;
  }
  return freed;
}

// One home-storage unit: a rack or fridge, a bin, or an alt cellar.
export type StorageUnitRef = { kind: 'rack' | 'bin' | 'location'; id: string };

// Free up to `n` of a wine's bottles from ONE storage unit only — used when an
// action starts from that unit's screen, so the bottles leave the place the user
// is looking at. Returns how many were freed (the rest is the caller's to find).
export async function releaseFromUnit(wineId: string, unit: StorageUnitRef, n: number): Promise<number> {
  if (n <= 0) return 0;
  if (unit.kind === 'rack') return removeSlotsForWine(wineId, n, unit.id);
  if (unit.kind === 'location') return releaseFromLocation(wineId, unit.id, n);
  const { data: cells, error } = await supabase.from('bin_cells').select('id').eq('bin_id', unit.id);
  if (error) throw error;
  const cellIds = new Set((cells ?? []).map((c: { id: string }) => c.id));
  let freed = 0;
  for (const p of await fetchPlacementsForWine(wineId)) {
    if (freed >= n) break;
    if (p.kind !== 'bin' || !p.bin_cell_id || !cellIds.has(p.bin_cell_id)) continue;
    freed += await decrementPlacement(p.id, Math.min(n - freed, p.quantity ?? 0));
  }
  return freed;
}

// Remove up to `by` bottles from ONE placement (a specific spot), deleting the
// row when that empties it. Returns how many were actually removed: fewer than
// `by` when the placement held fewer than a cached count said (or is gone).
export async function decrementPlacement(placementId: string, by: number): Promise<number> {
  const { data, error } = await supabase
    .from('cellar_placements')
    .select('quantity')
    .eq('id', placementId)
    .maybeSingle();
  if (error) throw error;
  const held = data?.quantity ?? 0;
  const removed = Math.min(held, Math.max(0, by));
  if (removed === 0) return 0;
  const { data: changed, error: writeErr } = held > removed
    ? await supabase.from('cellar_placements').update({ quantity: held - removed }).eq('id', placementId).select('id')
    : await supabase.from('cellar_placements').delete().eq('id', placementId).select('id');
  if (writeErr) throw writeErr;
  if (!changed?.length) throw refusedWriteError();
  return removed;
}

// A wine "row" as it appears inside an alt cellar: the wine's details but with
// the quantity + case of its placement THERE (a wine can also be racked/binned
// elsewhere). Shaped like a CellarWine so the alt-cellar screen renders it.
export type LocationWineRow = CellarWine & { placement_id: string };

export async function fetchLocationPlacementRows(locationId: string): Promise<LocationWineRow[]> {
  // Paged + chunked: an imported external cellar can hold thousands of wines.
  const rows = await selectAllPages<CellarPlacement>((from, to) =>
    supabase
      .from('cellar_placements')
      .select(COLS)
      .eq('storage_location_id', locationId)
      .eq('kind', 'location')
      // Add-order: oldest placement first, so wines land in the order they were
      // added to this alt cellar (incl. via a filter case) rather than arbitrarily.
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
      .range(from, to) as any);
  if (rows.length === 0) return [];
  const wines = await selectAllInChunks<CellarWine>(rows.map((p) => p.cellar_wine_id), (chunk, from, to) =>
    supabase.from('cellar_wines').select('*').in('id', chunk)
      .order('id', { ascending: true }).range(from, to) as any);
  const wineById = new Map(wines.map((w) => [w.id, w]));
  return rows.flatMap((p) => {
    const w = wineById.get(p.cellar_wine_id);
    // Archived wines aren't physically stored here.
    if (!w || w.archived_at) return [];
    return [{ ...w, quantity: p.quantity, case_id: p.case_id, placement_id: p.id }];
  });
}

// File an existing alt-cellar placement into a case (or out of one with null).
// Case membership lives on the placement.
export async function setPlacementCase(placementId: string, caseId: string | null): Promise<void> {
  assertCanEditCellar();
  const { data, error } = await supabase
    .from('cellar_placements')
    .update({ case_id: caseId })
    .eq('id', placementId)
    .select('id');
  if (error) throw error;
  if (!data?.length) throw refusedWriteError();
}

// Which of these storage_location ids are EXTERNAL (offsite/imported) cellars.
// External cellars are never robbed by a move of home bottles unless they're the
// only place the wine is.
export async function fetchExternalLocationIds(locationIds: (string | null | undefined)[]): Promise<Set<string>> {
  const out = new Set<string>();
  for (const chunk of chunkIds(locationIds)) {
    const { data, error } = await supabase
      .from('storage_locations').select('id').eq('is_external', true).in('id', chunk);
    if (error) throw error;
    for (const r of (data ?? []) as { id: string }[]) out.add(r.id);
  }
  return out;
}

// Delete every APP-OWNED placement of a wine: its 'bin' placements and its
// 'location' (alt-cellar) placements — by default only HOME alt cellars
// (keepExternal: true leaves placements in is_external cellars untouched; pass
// keepExternal: false to clear those too). Does NOT touch rack/fridge placements:
// those are derived from rack_slots, so clear racks via the racks API
// (clearWineFromRacks / removeSlotsForWine in ./racks). The wine's quantity is
// untouched — the cleared bottles simply become unplaced (loose). Returns how many
// bottles were un-placed.
export async function clearAppPlacementsForWine(
  wineId: string, opts?: { keepExternal?: boolean },
): Promise<number> {
  const keepExternal = opts?.keepExternal ?? true;
  const all = (await fetchPlacementsForWine(wineId)).filter((p) => p.kind === 'bin' || p.kind === 'location');
  if (all.length === 0) return 0;
  const external = keepExternal
    ? await fetchExternalLocationIds(all.filter((p) => p.kind === 'location').map((p) => p.storage_location_id))
    : new Set<string>();
  const doomed = all.filter((p) => !(p.kind === 'location' && p.storage_location_id && external.has(p.storage_location_id)));
  for (const chunk of chunkIds(doomed.map((p) => p.id))) {
    const { error } = await supabase.from('cellar_placements').delete().in('id', chunk);
    if (error) throw error;
  }
  return placedCount(doomed);
}

// True when a cellar_wines row carries anything that would be LOST if the row
// were deleted (ON DELETE CASCADE): removal/archive history, notes, a review,
// custom-filter memberships, or a community post. Conservative — any read error
// counts as "has history" so we never delete on doubt.
async function wineRowHasHistory(wineId: string): Promise<boolean> {
  try {
    const { data: row, error } = await supabase
      .from('cellar_wines')
      .select('user_notes, review_note, review_score, review_location, review_date, review_entries, cellar_note')
      .eq('id', wineId)
      .maybeSingle();
    if (error) return true;
    if (!row) return false; // already gone — nothing to lose
    const r = row as any;
    const nonEmpty = (v: unknown) => v != null && String(v).trim() !== '';
    if (nonEmpty(r.user_notes) || nonEmpty(r.review_note) || r.review_score != null
      || nonEmpty(r.review_location) || r.review_date != null || nonEmpty(r.cellar_note)) return true;
    if (Array.isArray(r.review_entries) && r.review_entries.length > 0) return true;
    for (const table of ['cellar_wine_removals', 'custom_filter_wines', 'community_posts']) {
      const { count, error: cErr } = await supabase
        .from(table).select('cellar_wine_id', { count: 'exact', head: true }).eq('cellar_wine_id', wineId);
      if (cErr) return true;
      if ((count ?? 0) > 0) return true;
    }
    return false;
  } catch {
    return true;
  }
}

// Fold ALL of `fromId`'s bottles + placements into `intoId`, then delete `fromId`.
// Caller must have checked `fromId` has no history. Quantity is raised FIRST so the
// mig-107 trim never sees placements above quantity mid-merge.
async function absorbWineRow(intoId: string, fromId: string): Promise<void> {
  const [{ data: into, error: e1 }, { data: from, error: e2 }] = await Promise.all([
    supabase.from('cellar_wines').select('quantity').eq('id', intoId).maybeSingle(),
    supabase.from('cellar_wines').select('quantity').eq('id', fromId).maybeSingle(),
  ]);
  if (e1) throw e1;
  if (e2) throw e2;
  const { error: qErr } = await supabase.from('cellar_wines')
    .update({ quantity: (into?.quantity ?? 0) + (from?.quantity ?? 0) }).eq('id', intoId);
  if (qErr) throw qErr;
  // Rack placements are derived from rack_slots — repoint the slots (the rack
  // trigger resyncs both wines). Bin/location placements are app-owned: merge each
  // onto the surviving row's matching placement, then drop the old one.
  const { error: rsErr } = await supabase.from('rack_slots').update({ cellar_wine_id: intoId }).eq('cellar_wine_id', fromId);
  if (rsErr) throw rsErr;
  for (const p of await fetchPlacementsForWine(fromId)) {
    if (p.kind === 'bin' && p.bin_cell_id) await addBinPlacement(intoId, p.bin_cell_id, p.quantity ?? 0);
    else if (p.kind === 'location' && p.storage_location_id) {
      await addLocationPlacement(intoId, p.storage_location_id, p.case_id ?? null, p.quantity ?? 0);
    } else continue;
    const { error } = await supabase.from('cellar_placements').delete().eq('id', p.id);
    if (error) throw error;
  }
  await deleteCellarWine(fromId);
}

// Quantity writes for moves and location deletes. Each checks the row was really
// updated: RLS (a view-only member, an expired session) turns a refused update
// into a silent no-op, which must not read as success.
async function setWineQuantity(wineId: string, quantity: number): Promise<void> {
  const { data, error } = await supabase.from('cellar_wines').update({ quantity }).eq('id', wineId).select('id');
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('That wine could not be updated — please pull to refresh (you may need to sign in again).');
}
async function addToWineQuantity(wineId: string, by: number): Promise<void> {
  const { data, error } = await supabase.from('cellar_wines').select('quantity').eq('id', wineId).maybeSingle();
  if (error) throw error;
  await setWineQuantity(wineId, (data?.quantity ?? 0) + by);
}

// Move `count` bottles of a wine INTO an alt-cellar location — placement-native
// and merge-aware. This is the correct path for any "move to an alt cellar"
// (voice or manual): it frees the bottles from wherever they sit now and lands
// them in the destination. Freeing order: rack/fridge slots → bin cells → the
// wine's OTHER home alt-cellar placements → its loose (unplaced) bottles → and
// only as a last resort its EXTERNAL-cellar placements (so an offsite/imported
// cellar is never robbed while home bottles exist). Never robs the destination.
// It consolidates onto the wine identity's existing line there — so a bottle
// returning from the fridge bumps the alt cellar's count (3 → 4) on ONE row
// instead of spawning a duplicate line. An emptied source row is removed ONLY
// when it carries no history (removals, notes, review, filters, posts); otherwise
// the history-free twin is folded INTO the source instead, and if both carry
// history the bottles stay on the source row (two lines, nothing lost).
// `fromUnit`: the unit the move was started from — its bottles go first.
// Returns the id of the cellar line the bottles landed on (the source, or the
// twin they merged into — the source row may no longer exist).
export async function moveBottlesToLocation(
  source: {
    id: string; producer: string | null; wine_name: string | null;
    vintage: string | null; bottle_size_ml: number | null; quantity: number;
  },
  destLocationId: string,
  count: number,
  opts?: { fromUnit?: StorageUnitRef },
): Promise<string> {
  assertCanEditCellar();
  // Authoritative quantity from the DB (the caller's copy may be stale).
  const { data: srcRow, error: srcErr } = await supabase
    .from('cellar_wines').select('quantity').eq('id', source.id).maybeSingle();
  if (srcErr) throw srcErr;
  const srcQtyNow = (srcRow?.quantity as number | undefined) ?? source.quantity ?? 1;
  const n = Math.max(1, Math.min(count, srcQtyNow));
  // Loose = bottles with no placement, counted BEFORE anything is freed (freed
  // bottles become loose too, and must not be counted twice).
  const looseBefore = Math.max(0, srcQtyNow - placedCount(await fetchPlacementsForWine(source.id)));

  // 1. Free `n` bottles from the source's current storage.
  let toFree = n;
  const fromUnit = opts?.fromUnit;
  if (fromUnit && !(fromUnit.kind === 'location' && fromUnit.id === destLocationId)) {
    toFree -= await releaseFromUnit(source.id, fromUnit, toFree);
  }
  if (toFree > 0) toFree -= await removeSlotsForWine(source.id, toFree);
  if (toFree > 0) {
    const placements = await fetchPlacementsForWine(source.id);
    const external = await fetchExternalLocationIds(
      placements.filter((p) => p.kind === 'location').map((p) => p.storage_location_id));
    const isExt = (p: CellarPlacement) =>
      p.kind === 'location' && !!p.storage_location_id && external.has(p.storage_location_id);
    const take = async (list: CellarPlacement[]) => {
      for (const p of list) {
        if (toFree <= 0) break;
        toFree -= await decrementPlacement(p.id, Math.min(toFree, p.quantity ?? 0));
      }
    };
    // Bins, then home alt cellars other than the destination.
    await take(placements.filter((p) => p.kind === 'bin'));
    await take(placements.filter((p) => p.kind === 'location' && p.storage_location_id !== destLocationId && !isExt(p)));
    // Loose bottles need no freeing — use them before touching an external cellar.
    toFree -= Math.min(toFree, looseBefore);
    // Last resort: the wine only remains in an external cellar.
    if (toFree > 0) await take(placements.filter((p) => isExt(p) && p.storage_location_id !== destLocationId));
  }

  // 2. Merge into an existing line for this wine identity in the destination if
  //    one exists; otherwise place the bottles on the source row itself.
  const here = await fetchLocationPlacementRows(destLocationId);
  const twin = here.find((r) => r.id !== source.id && sameIdentity(r, source));

  if (!twin) {
    // First bottles of this wine here — keep them on the source row; we only
    // relocated existing bottles, so the row's total is unchanged.
    await addLocationPlacement(source.id, destLocationId, null, n);
    return source.id;
  }

  const srcQty = srcQtyNow - n;
  if (srcQty > 0) {
    // Partial move: bump the twin's line + total, shed n from the source (row kept).
    await addLocationPlacement(twin.id, destLocationId, null, n);
    await addToWineQuantity(twin.id, n);
    await setWineQuantity(source.id, srcQty);
    return twin.id;
  }

  // Whole-row move: the source would empty. Deleting it cascades away its removal
  // history, filter memberships and notes/review — so only do that when it has none.
  if (!(await wineRowHasHistory(source.id))) {
    await addLocationPlacement(twin.id, destLocationId, null, n);
    await addToWineQuantity(twin.id, n);
    await deleteCellarWine(source.id);
    return twin.id;
  }
  // Source has history: land the bottles on the source row, then fold the twin
  // INTO it when the twin is history-free (one consolidated line, history kept).
  // If both carry history, leave two lines rather than lose anything.
  await addLocationPlacement(source.id, destLocationId, null, n);
  if (!(await wineRowHasHistory(twin.id))) await absorbWineRow(source.id, twin.id);
  return source.id;
}

type LineIdentity = { producer?: string | null; wine_name?: string | null; vintage?: string | null; bottle_size_ml?: number | null };

// Two cellar lines are the same wine in the same format — so bottles moved into
// a cellar that already holds that wine join its line there.
export function sameIdentity(a: LineIdentity, b: LineIdentity): boolean {
  return (a.producer ?? '') === (b.producer ?? '')
    && (a.wine_name ?? '') === (b.wine_name ?? '')
    && (a.vintage ?? null) === (b.vintage ?? null)
    && (a.bottle_size_ml ?? 750) === (b.bottle_size_ml ?? 750);
}

// Heal an impossible state: a wine whose `quantity` is BELOW the number of bottles
// physically in RACK SLOTS. A rack slot is unambiguously one real bottle sitting in a
// numbered space, so quantity can never be less than the slot count — when it is (a
// decrement drifted out of sync, e.g. an over-counted archive), correct quantity UP to
// the rack-slot total.
//
// IMPORTANT: only rack placements are trusted here. `location` (alt-cellar) and `bin`
// placements are COUNT MIRRORS, not physical slots: bins are rebuilt from `quantity`
// by the mig-104 trigger, and location placements over `quantity` are trimmed by the
// mig-107 trigger. Trusting those to raise `quantity` would let a stale/over placement
// (or an under-freed archive) resurrect bottles that were actually removed. So the heal
// reconciles rack-only and never inflates from a count-based placement.
// Narrow + idempotent: only touches rows that are genuinely inconsistent.
// Returns how many rows were healed.
export async function reconcileQuantityBelowPlacements(userId: string): Promise<number> {
  if (!canEditCellar()) return 0; // view-only members can't heal the owner's rows
  const wines = await selectAllPages<{ id: string; quantity: number }>((from, to) =>
    supabase
      .from('cellar_wines')
      .select('id, quantity')
      .eq('user_id', cellarOwner(userId))
      .is('archived_at', null)
      .order('id', { ascending: true })
      .range(from, to) as any);
  if (wines.length === 0) return 0;
  const placed = await fetchPlacementsForWines(wines.map((w) => w.id));
  const rackByWine = new Map<string, number>();
  for (const p of placed) {
    if (p.kind !== 'rack') continue; // rack slots only — physical ground truth
    rackByWine.set(p.cellar_wine_id, (rackByWine.get(p.cellar_wine_id) ?? 0) + (p.quantity ?? 0));
  }
  let healed = 0;
  for (const w of wines) {
    const rackSlots = rackByWine.get(w.id) ?? 0;
    if (rackSlots > (w.quantity ?? 0)) {
      const { error: upErr } = await supabase.from('cellar_wines').update({ quantity: rackSlots }).eq('id', w.id);
      if (!upErr) healed += 1;
    }
  }
  return healed;
}

// Merge-safe removal of the bottles a unit (rack/fridge/bin) held when the unit
// is deleted "& Contents". `countHere` is how many of the wine's bottles were in
// that unit. If the wine lived ENTIRELY in the unit, delete the whole wine;
// otherwise reduce its quantity by countHere (its bottles elsewhere survive). Call
// AFTER the unit itself is deleted, so the unit's slots/cells have already
// cascaded away and the remaining placements reflect the other units.
export async function trimOrDeleteWineOnUnitDelete(wineId: string, countHere: number): Promise<void> {
  const [{ data, error }, placements] = await Promise.all([
    supabase.from('cellar_wines').select('quantity').eq('id', wineId).maybeSingle(),
    fetchPlacementsForWine(wineId), // remaining placements (the deleted unit already cascaded)
  ]);
  if (error) throw error;
  const qty = (data?.quantity as number) ?? 0;
  const elsewhere = placedCount(placements);
  // Only delete the whole wine when nothing of it remains in any OTHER unit and the
  // deleted unit held its entire quantity — otherwise trim, never below what's still
  // placed elsewhere, so bottles in other racks/bins/cellars are never destroyed.
  if (elsewhere <= 0 && countHere >= qty) {
    await deleteCellarWine(wineId);
  } else {
    await setWineQuantity(wineId, Math.max(elsewhere, qty - countHere, 1));
  }
}

// ---- Deleting an alt cellar --------------------------------------------------

// "Delete location & move wines to Unplaced Bottles": remove the location but
// keep every bottle in the cellar. The DB cascades this location's placements
// on delete, so those bottles simply become unplaced.
export async function deleteLocationKeepWines(locationId: string): Promise<void> {
  await deleteStorageLocation(locationId);
}

// One live wine with bottles in an alt cellar: how many are there, how many are
// placed elsewhere, its whole quantity and its reviews (which go if it does).
export type LocationWine = { id: string; here: number; elsewhere: number; quantity: number; row: Pick<CellarWine, 'review_entries'> };

// Deleting the cellar's contents deletes a wine outright when every bottle of
// it is here; otherwise it keeps its bottles elsewhere.
export function goesWithLocation(w: LocationWine): boolean {
  return w.elsewhere <= 0 && w.quantity - w.here <= 0;
}

// The live wines filed in an alt cellar, from its placements. An archived
// wine's stray placement isn't a bottle there, so it's left out (it just goes
// with the location).
export async function fetchLocationWines(locationId: string): Promise<LocationWine[]> {
  const hereByWine = new Map<string, number>();
  for (const p of await fetchPlacementsForLocation(locationId)) {
    hereByWine.set(p.cellar_wine_id, (hereByWine.get(p.cellar_wine_id) ?? 0) + (p.quantity ?? 0));
  }
  const ids = [...hereByWine.keys()];
  const [rows, placements] = await Promise.all([
    selectAllInChunks<{ id: string; quantity: number; archived_at: string | null; review_entries: CellarWine['review_entries'] }>(ids, (chunk, from, to) =>
      supabase.from('cellar_wines').select('id, quantity, archived_at, review_entries').in('id', chunk)
        .order('id', { ascending: true }).range(from, to) as any),
    fetchPlacementsForWines(ids),
  ]);
  const elsewhere = new Map<string, number>();
  for (const p of placements) {
    if (p.storage_location_id !== locationId) elsewhere.set(p.cellar_wine_id, (elsewhere.get(p.cellar_wine_id) ?? 0) + (p.quantity ?? 0));
  }
  return rows.filter((r) => !r.archived_at).map((r) => ({
    id: r.id, here: hereByWine.get(r.id) ?? 0, elsewhere: elsewhere.get(r.id) ?? 0, quantity: r.quantity ?? 0, row: r,
  }));
}

// "Delete location & wines": remove the location AND the bottles filed in it.
// A wine that lives ONLY here is deleted outright; one that also lives
// elsewhere (e.g. an import that merged into a wine already at home) keeps its
// other bottles. Pass `wines` when they've just been read for the
// confirmation. Returns how many whole wines were deleted.
export async function deleteLocationAndWines(
  locationId: string,
  // Fires as each wine is processed so a big import's delete shows real progress
  // (deleting ~1000 rows one-by-one is slow; without this the screen looks frozen).
  onProgress?: (done: number, total: number) => void,
  wines?: LocationWine[],
): Promise<{ deletedWines: number }> {
  assertCanEditCellar();
  const list = wines ?? await fetchLocationWines(locationId);
  let deletedWines = 0;
  onProgress?.(0, list.length);
  for (const [i, w] of list.entries()) {
    if (goesWithLocation(w)) {
      // Its placements cascade with it.
      await deleteCellarWine(w.id);
      deletedWines += 1;
    } else {
      // Free its bottles here before lowering the count: the quantity trigger
      // (migration 107) trims alt-cellar placements newest first, which could
      // otherwise take them from another cellar. Never below what's placed
      // elsewhere.
      const { error } = await supabase.from('cellar_placements').delete()
        .eq('cellar_wine_id', w.id).eq('storage_location_id', locationId);
      if (error) throw error;
      await setWineQuantity(w.id, Math.max(w.elsewhere, w.quantity - w.here, 1));
    }
    onProgress?.(i + 1, list.length);
  }
  // Cascades any remaining placements, cases and location filters.
  await deleteStorageLocation(locationId);
  return { deletedWines };
}
