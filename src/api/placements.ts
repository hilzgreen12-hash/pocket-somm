import { supabase } from './supabase';
import { removeSlotsForWine } from './racks';
import { deleteStorageLocation } from './storageLocations';
import { deleteCellarWine } from './cellar';

// A single placement of some of a wine's bottles in ONE spot — a rack slot, a
// bin cell, or an alt cellar (optionally in a case). Introduced by the unified
// home-storage model (migration 103). During Phase 2 these are kept in sync with
// the legacy fields by DB triggers (migration 104); Phase 3 writes them directly.
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
export async function fetchPlacementsForWine(wineId: string): Promise<CellarPlacement[]> {
  const { data, error } = await supabase
    .from('cellar_placements')
    .select(COLS)
    .eq('cellar_wine_id', wineId);
  if (error) throw error;
  return (data ?? []) as CellarPlacement[];
}

// Placements for many wines at once (batched — for list/stats screens). Chunked
// so a big cellar doesn't blow the `in (...)` limit.
export async function fetchPlacementsForWines(wineIds: string[]): Promise<CellarPlacement[]> {
  const ids = Array.from(new Set(wineIds.filter(Boolean)));
  if (ids.length === 0) return [];
  const CHUNK = 300;
  const out: CellarPlacement[] = [];
  for (let i = 0; i < ids.length; i += CHUNK) {
    const slice = ids.slice(i, i + CHUNK);
    const { data, error } = await supabase
      .from('cellar_placements')
      .select(COLS)
      .in('cellar_wine_id', slice);
    if (error) throw error;
    out.push(...((data ?? []) as CellarPlacement[]));
  }
  return out;
}

// Every placement that lives in a given rack / bin / alt cellar — for the
// per-location screens and their bottle counts.
export async function fetchPlacementsForRack(rackId: string): Promise<CellarPlacement[]> {
  const { data, error } = await supabase.from('cellar_placements').select(COLS).eq('rack_id', rackId);
  if (error) throw error;
  return (data ?? []) as CellarPlacement[];
}
export async function fetchPlacementsForLocation(locationId: string): Promise<CellarPlacement[]> {
  const { data, error } = await supabase.from('cellar_placements').select(COLS).eq('storage_location_id', locationId);
  if (error) throw error;
  return (data ?? []) as CellarPlacement[];
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
    const { error } = await supabase
      .from('cellar_placements')
      .update({ quantity: (existing.quantity ?? 0) + quantity })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('cellar_placements').insert({
      cellar_wine_id: wineId, kind: 'location', quantity, storage_location_id: locationId, case_id: caseId,
    });
    if (error) throw error;
  }
}

// Remove `by` bottles from ONE placement (a specific spot). Deletes the row when
// that empties it. Used by the alt-cellar partial "Move Wine/Bottles" flow — the
// moved bottles either become loose (Full Cellar List) or land in a new placement.
// Free `n` bottles of a wine FROM wherever they're stored — rack/fridge slots
// first, then alt-cellar location placements. Use when bottles leave the active
// cellar (archive / removal) so a placement count (e.g. "3 bottles in Large Wine
// Rack") never lingers above the wine's real quantity. Mirrors the freeing step of
// moveBottlesToLocation. Returns how many bottles were actually freed.
export async function releaseBottlesFromPlacements(wineId: string, n: number): Promise<number> {
  if (n <= 0) return 0;
  let freed = await removeSlotsForWine(wineId, n);
  let toFree = n - freed;
  if (toFree > 0) {
    const locs = (await fetchPlacementsForWine(wineId)).filter((p) => p.kind === 'location');
    for (const p of locs) {
      if (toFree <= 0) break;
      const take = Math.min(toFree, p.quantity ?? 0);
      if (take > 0) { await decrementPlacement(p.id, take); toFree -= take; freed += take; }
    }
  }
  return freed;
}

export async function decrementPlacement(placementId: string, by: number): Promise<void> {
  const { data, error } = await supabase
    .from('cellar_placements')
    .select('quantity')
    .eq('id', placementId)
    .maybeSingle();
  if (error) throw error;
  const remaining = (data?.quantity ?? 0) - Math.max(0, by);
  if (remaining > 0) {
    const { error: updErr } = await supabase
      .from('cellar_placements')
      .update({ quantity: remaining })
      .eq('id', placementId);
    if (updErr) throw updErr;
  } else {
    const { error: delErr } = await supabase.from('cellar_placements').delete().eq('id', placementId);
    if (delErr) throw delErr;
  }
}

// A wine "row" as it appears inside an alt cellar: the wine's details but with
// the quantity + case of its placement THERE (a wine can also be racked/binned
// elsewhere). Shaped like a CellarWine so the alt-cellar screen renders it.
export async function fetchLocationPlacementRows(locationId: string): Promise<any[]> {
  const { data: placements, error } = await supabase
    .from('cellar_placements')
    .select(COLS)
    .eq('storage_location_id', locationId)
    .eq('kind', 'location');
  if (error) throw error;
  const rows = (placements ?? []) as CellarPlacement[];
  if (rows.length === 0) return [];
  const wineIds = Array.from(new Set(rows.map((p) => p.cellar_wine_id)));
  const { data: wines, error: wErr } = await supabase.from('cellar_wines').select('*').in('id', wineIds);
  if (wErr) throw wErr;
  const wineById = new Map((wines ?? []).map((w: any) => [w.id, w]));
  return rows.flatMap((p) => {
    const w = wineById.get(p.cellar_wine_id);
    // Archived / wishlist wines aren't physically stored here.
    if (!w || w.archived_at || w.is_wishlist) return [];
    return [{ ...w, quantity: p.quantity, case_id: p.case_id, placement_id: p.id }];
  });
}

// Delete ALL of a wine's alt-cellar (location) placements — used when a wine
// leaves every alt cellar at once (e.g. a whole-wine move into a rack/fridge).
// The DB no longer mirrors the legacy storage_location_id into these rows
// (migration 106), so they must be cleared explicitly or the wine lingers as a
// ghost line in the alt cellar it left.
// File an existing alt-cellar placement into a case (or out of one with null).
// Alt-cellar case membership lives on the placement, not the legacy
// cellar_wines.case_id, so "Add from This Cellar List" sets it here.
export async function setPlacementCase(placementId: string, caseId: string | null): Promise<void> {
  const { error } = await supabase
    .from('cellar_placements')
    .update({ case_id: caseId })
    .eq('id', placementId);
  if (error) throw error;
}

export async function clearLocationPlacements(wineId: string): Promise<void> {
  const { error } = await supabase
    .from('cellar_placements')
    .delete()
    .eq('cellar_wine_id', wineId)
    .eq('kind', 'location');
  if (error) throw error;
}

// Move `count` bottles of a wine INTO an alt-cellar location — placement-native
// and merge-aware. This is the correct path for any "move to an alt cellar"
// (voice or manual): it frees the bottles from wherever they sit now (rack/fridge
// slots first, then the source's own OTHER alt-cellar placements) and lands them
// in the destination. Crucially it consolidates onto the wine identity's existing
// line there — so a bottle returning from the fridge bumps the alt cellar's
// count (3 → 4) on ONE row instead of vanishing (no location placement was ever
// written) or spawning a duplicate line. An emptied source row is removed.
export async function moveBottlesToLocation(
  source: {
    id: string; producer: string | null; wine_name: string | null;
    vintage: string | null; bottle_size_ml: number | null; quantity: number;
  },
  destLocationId: string,
  count: number,
): Promise<void> {
  const n = Math.max(1, Math.min(count, source.quantity ?? 1));

  // 1. Free `n` bottles from the source's current storage: rack/fridge slots
  //    first, then its own alt-cellar placements OTHER than the destination
  //    (a cellar-to-cellar move) — never rob from the destination itself.
  let toFree = n - (await removeSlotsForWine(source.id, n));
  if (toFree > 0) {
    const srcLocs = (await fetchPlacementsForWine(source.id))
      .filter((p) => p.kind === 'location' && p.storage_location_id !== destLocationId);
    for (const p of srcLocs) {
      if (toFree <= 0) break;
      const take = Math.min(toFree, p.quantity ?? 0);
      if (take > 0) { await decrementPlacement(p.id, take); toFree -= take; }
    }
  }

  // 2. Merge into an existing line for this wine identity in the destination if
  //    one exists; otherwise place the bottles on the source row itself.
  const here = await fetchLocationPlacementRows(destLocationId);
  const sameIdentity = (r: any) =>
    (r.producer ?? '') === (source.producer ?? '') &&
    (r.wine_name ?? '') === (source.wine_name ?? '') &&
    (r.vintage ?? null) === (source.vintage ?? null) &&
    (r.bottle_size_ml ?? 750) === (source.bottle_size_ml ?? 750);
  const twin = here.find((r) => r.id !== source.id && sameIdentity(r));

  if (twin) {
    // Bump the twin's line + its row total, and shed the moved bottles from the
    // source (delete the row when it empties — e.g. a fridge clone returning
    // home), so the wine shows a single consolidated line.
    await addLocationPlacement(twin.id, destLocationId, null, n);
    const { data: twRow } = await supabase
      .from('cellar_wines').select('quantity').eq('id', twin.id).maybeSingle();
    await supabase.from('cellar_wines')
      .update({ quantity: (twRow?.quantity ?? 0) + n }).eq('id', twin.id);
    const srcQty = (source.quantity ?? 0) - n;
    if (srcQty <= 0) await supabase.from('cellar_wines').delete().eq('id', source.id);
    else await supabase.from('cellar_wines').update({ quantity: srcQty }).eq('id', source.id);
  } else {
    // First bottles of this wine here — keep them on the source row; we only
    // relocated existing bottles, so the row's total is unchanged.
    await addLocationPlacement(source.id, destLocationId, null, n);
  }
}

// Heal wines left in the legacy-only state by an OLD move: a row that names a
// home alt cellar in `storage_location_id` but has NO matching 'location'
// placement. Since migration 106 the DB stopped mirroring that legacy field, so
// such a bottle is invisible in the alt cellar AND shows as a split line in the
// Full Cellar List (the "moved to fridge and back, now 1 + 3" bug). Each orphan
// is folded back via moveBottlesToLocation, which merges it onto the wine's
// existing line in that cellar (consolidating the split to one line, correct
// count) and drops the leftover row.
//
// Deliberately narrow + idempotent: only ACTIVE, non-wishlist rows that (a) point
// at one of the given HOME location ids, (b) aren't awaiting a unit slot, and
// (c) have no location placement yet. External/imported cellars are excluded by
// the caller so a big import is never bulk-rewritten. Returns how many it healed.
export async function reconcileLegacyLocationWines(
  userId: string, homeLocationIds: string[],
): Promise<number> {
  const homeSet = new Set(homeLocationIds.filter(Boolean));
  if (homeSet.size === 0) return 0;
  const { data: rows, error } = await supabase
    .from('cellar_wines')
    .select('id, producer, wine_name, vintage, bottle_size_ml, quantity, storage_location_id')
    .eq('user_id', userId)
    .is('archived_at', null)
    .eq('is_wishlist', false)
    .is('awaiting_placement_unit_id', null)
    .not('storage_location_id', 'is', null);
  if (error) throw error;
  const candidates = (rows ?? []).filter((r: any) => homeSet.has(r.storage_location_id));
  if (candidates.length === 0) return 0;
  const placed = await fetchPlacementsForWines(candidates.map((r: any) => r.id));
  const hasLoc = new Set(placed.filter((p) => p.kind === 'location').map((p) => p.cellar_wine_id));
  let healed = 0;
  for (const r of candidates) {
    if (hasLoc.has(r.id)) continue; // already has a real placement — leave it
    await moveBottlesToLocation(r as any, r.storage_location_id, r.quantity ?? 1);
    healed++;
  }
  return healed;
}

// Heal an impossible state: a wine whose `quantity` is BELOW the number of bottles
// physically placed (rack slots + bin + alt-cellar). Placed bottles really exist,
// so quantity can never be less — when it is (a decrement drifted out of sync with
// the placement, e.g. an over-counted archive), correct quantity UP to the placed
// total. Narrow + idempotent: only touches rows that are genuinely inconsistent.
// Returns how many rows were healed.
export async function reconcileQuantityBelowPlacements(userId: string): Promise<number> {
  const { data: rows, error } = await supabase
    .from('cellar_wines')
    .select('id, quantity')
    .eq('user_id', userId)
    .is('archived_at', null)
    .eq('is_wishlist', false);
  if (error) throw error;
  const wines = (rows ?? []) as { id: string; quantity: number }[];
  if (wines.length === 0) return 0;
  const placed = await fetchPlacementsForWines(wines.map((w) => w.id));
  const placedByWine = new Map<string, number>();
  for (const p of placed) {
    placedByWine.set(p.cellar_wine_id, (placedByWine.get(p.cellar_wine_id) ?? 0) + (p.quantity ?? 0));
  }
  let healed = 0;
  for (const w of wines) {
    const placedSum = placedByWine.get(w.id) ?? 0;
    if (placedSum > (w.quantity ?? 0)) {
      const { error: upErr } = await supabase.from('cellar_wines').update({ quantity: placedSum }).eq('id', w.id);
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
    const remaining = Math.max(elsewhere, qty - countHere, 1);
    await supabase.from('cellar_wines').update({ quantity: remaining }).eq('id', wineId);
  }
}

// ---- Deleting a storage location (long-press in the Location filter) ---------

// "Delete location & move wines to Unplaced Bottles": remove the location but
// keep every bottle in the cellar. The DB cascades this location's placement
// rows on delete (so those bottles become unplaced) and SET-NULLs the legacy
// storage_location_id pointer — so this is simply the location delete.
export async function deleteLocationKeepWines(locationId: string): Promise<void> {
  await deleteStorageLocation(locationId);
}

// "Delete location & wines": remove the location AND the bottles filed in it.
// A wine that lives ONLY here is deleted outright; a wine that also lives
// elsewhere (e.g. an import that MERGED into an existing cellar wine, so it has
// bottles at home too) keeps its other bottles — we only subtract the count that
// was in this location. Returns how many whole wines were deleted.
export async function deleteLocationAndWines(
  locationId: string,
  // Fires as each wine is processed so a big import's delete shows real progress
  // (deleting ~1000 rows one-by-one is slow; without this the screen looks frozen).
  onProgress?: (done: number, total: number) => void,
): Promise<{ deletedWines: number }> {
  // Bottles filed in this location, summed per wine.
  const here = await fetchPlacementsForLocation(locationId);
  const hereByWine = new Map<string, number>();
  for (const p of here) {
    hereByWine.set(p.cellar_wine_id, (hereByWine.get(p.cellar_wine_id) ?? 0) + (p.quantity ?? 0));
  }
  // Also catch wines pointed here only via the legacy column (no placement row):
  // treat the whole wine as living here.
  const { data: legacyRows, error: legacyErr } = await supabase
    .from('cellar_wines').select('id, quantity').eq('storage_location_id', locationId);
  if (legacyErr) throw legacyErr;
  for (const w of (legacyRows ?? []) as { id: string; quantity: number }[]) {
    if (!hereByWine.has(w.id)) hereByWine.set(w.id, w.quantity ?? 0);
  }

  const wineIds = [...hereByWine.keys()];
  let deletedWines = 0;
  if (wineIds.length > 0) {
    // Placements elsewhere (any spot that isn't this location) + current totals.
    const allPlacements = await fetchPlacementsForWines(wineIds);
    const otherByWine = new Map<string, number>();
    for (const p of allPlacements) {
      if (p.storage_location_id === locationId) continue;
      otherByWine.set(p.cellar_wine_id, (otherByWine.get(p.cellar_wine_id) ?? 0) + (p.quantity ?? 0));
    }
    const { data: wineRows, error: wErr } = await supabase
      .from('cellar_wines').select('id, quantity').in('id', wineIds);
    if (wErr) throw wErr;
    const qtyById = new Map((wineRows ?? []).map((w: any) => [w.id, w.quantity ?? 0]));

    let processed = 0;
    onProgress?.(0, wineIds.length);
    for (const id of wineIds) {
      const inHere = hereByWine.get(id) ?? 0;
      const total = qtyById.get(id) ?? 0;
      const otherPlaced = otherByWine.get(id) ?? 0;
      const remaining = total - inHere;
      if (otherPlaced <= 0 && remaining <= 0) {
        // Whole wine lives here → delete it (its placements cascade).
        await deleteCellarWine(id);
        deletedWines += 1;
      } else {
        // Wine also has bottles elsewhere → keep it, drop just the here-count.
        // Its placement rows in this location cascade when the location is
        // deleted below.
        await supabase.from('cellar_wines').update({ quantity: Math.max(1, remaining) }).eq('id', id);
      }
      onProgress?.(++processed, wineIds.length);
    }
  }

  // Remove the location itself — cascades any remaining placements + storage
  // cases + location filters, and nulls the legacy pointer on kept wines.
  await deleteStorageLocation(locationId);
  return { deletedWines };
}
