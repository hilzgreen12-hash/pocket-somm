import { supabase } from './supabase';
import { removeSlotsForWine } from './racks';

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
