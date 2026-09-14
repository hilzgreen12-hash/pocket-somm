import { supabase } from './supabase';

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
