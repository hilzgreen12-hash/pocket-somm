import { supabase } from './supabase';
import { removeSlotsForWine } from './racks';
import { deleteStorageLocation } from './storageLocations';
import { deleteCellarWine } from './cellar';
import { selectAllPages, selectAllInChunks, chunkIds } from './paging';

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

// Every placement that lives in a given rack / bin / alt cellar — for the
// per-location screens and their bottle counts. Paged (an imported external
// cellar can hold thousands of placements).
export async function fetchPlacementsForRack(rackId: string): Promise<CellarPlacement[]> {
  return selectAllPages<CellarPlacement>((from, to) =>
    supabase.from('cellar_placements').select(COLS)
      .eq('rack_id', rackId)
      .order('id', { ascending: true })
      .range(from, to) as any);
}
export async function fetchPlacementsForLocation(locationId: string): Promise<CellarPlacement[]> {
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

// ---- App-managed 'bin' placements (Phase 4, mig 116) -----------------------

// Add `quantity` bottles of a wine to ONE bin cell, merging into an existing
// (wine, cell) bin placement rather than spawning a duplicate. This is how a
// wine comes to sit in a bin now — NOT via cellar_wines.bin_cell_id.
export async function addBinPlacement(wineId: string, cellId: string, quantity: number): Promise<void> {
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
    const { error } = await supabase
      .from('cellar_placements')
      .update({ quantity: (existing.quantity ?? 0) + quantity })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('cellar_placements').insert({
      cellar_wine_id: wineId, kind: 'bin', quantity, bin_cell_id: cellId,
    });
    if (error) throw error;
  }
}

// The label thumbnail of the MOST-RECENTLY-PLACED live wine in each home storage
// unit — rack/fridge (by rack_id), bin (by bin_cell_id → bin), alt cellar (by
// storage_location_id) — so the Cellar carousel tiles can show the last wine
// added there (and refresh as new wines land). Newest placement first; first
// non-empty thumbnail per location wins. RLS scopes rows to the user.
export async function fetchLatestLocationThumbs(userId: string): Promise<{
  rack: Record<string, string>; bin: Record<string, string>; location: Record<string, string>;
}> {
  const result = { rack: {} as Record<string, string>, bin: {} as Record<string, string>, location: {} as Record<string, string> };
  // bin cell → bin id (so a bin placement can resolve to its unit).
  const { data: binRows } = await supabase.from('wine_racks').select('id').eq('user_id', userId).eq('storage_type', 'bin');
  const binIds = (binRows ?? []).map((b) => b.id);
  const cellToBin: Record<string, string> = {};
  if (binIds.length) {
    // Best-effort (as before): a failed cell read just means no bin thumbs.
    try {
      const cells = await selectAllInChunks<{ id: string; bin_id: string }>(binIds, (chunk, from, to) =>
        supabase.from('bin_cells').select('id, bin_id').in('bin_id', chunk)
          .order('id', { ascending: true }).range(from, to) as any);
      for (const c of cells) cellToBin[c.id] = c.bin_id;
    } catch { /* tolerated */ }
  }
  // Paged — a big imported cellar has far more than 1000 placements. Ordered
  // newest-first with id as a tiebreak so pages are stable.
  const data = await selectAllPages<any>((from, to) =>
    supabase
      .from('cellar_placements')
      .select('kind, rack_id, bin_cell_id, storage_location_id, created_at, wine:cellar_wines!inner(label_image_path, archived_at, is_wishlist)')
      .order('created_at', { ascending: false })
      .order('id', { ascending: true })
      .range(from, to) as any);
  for (const p of data) {
    const w = p.wine;
    if (!w || w.archived_at || w.is_wishlist || !w.label_image_path) continue;
    if (p.kind === 'rack' && p.rack_id) { if (!result.rack[p.rack_id]) result.rack[p.rack_id] = w.label_image_path; }
    else if (p.kind === 'bin' && p.bin_cell_id) { const b = cellToBin[p.bin_cell_id]; if (b && !result.bin[b]) result.bin[b] = w.label_image_path; }
    else if (p.kind === 'location' && p.storage_location_id) { if (!result.location[p.storage_location_id]) result.location[p.storage_location_id] = w.label_image_path; }
  }
  return result;
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
    const take = Math.min(toFree, p.quantity ?? 0);
    if (take > 0) { await decrementPlacement(p.id, take); toFree -= take; freed += take; }
  }
  return freed;
}

// Delete every bin placement in a set of cells (empty cell / empty bin). The
// wines survive loose (their quantity is untouched — only the cell membership
// goes). Returns nothing; callers invalidate.
export async function clearBinCellPlacements(cellIds: string[]): Promise<void> {
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
  const { error } = await supabase
    .from('cellar_placements')
    .delete()
    .eq('kind', 'bin')
    .eq('cellar_wine_id', wineId)
    .eq('bin_cell_id', cellId);
  if (error) throw error;
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
    // Then alt-cellar locations, then bins — all app-owned placement rows.
    const rest = (await fetchPlacementsForWine(wineId)).filter((p) => p.kind === 'location' || p.kind === 'bin');
    for (const p of rest) {
      if (toFree <= 0) break;
      const take = Math.min(toFree, p.quantity ?? 0);
      if (take > 0) { await decrementPlacement(p.id, take); toFree -= take; freed += take; }
    }
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
    const take = Math.min(toFree, p.quantity ?? 0);
    if (take > 0) { await decrementPlacement(p.id, take); toFree -= take; freed += take; }
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
  const wines = await selectAllInChunks<any>(rows.map((p) => p.cellar_wine_id), (chunk, from, to) =>
    supabase.from('cellar_wines').select('*').in('id', chunk)
      .order('id', { ascending: true }).range(from, to) as any);
  const wineById = new Map(wines.map((w: any) => [w.id, w]));
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

// Which of these storage_location ids are EXTERNAL (offsite/imported) cellars.
// External cellars are never robbed by a move of home bottles unless they're the
// only place the wine is.
async function fetchExternalLocationIds(locationIds: (string | null | undefined)[]): Promise<Set<string>> {
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
export async function wineRowHasHistory(wineId: string): Promise<boolean> {
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
export async function moveBottlesToLocation(
  source: {
    id: string; producer: string | null; wine_name: string | null;
    vintage: string | null; bottle_size_ml: number | null; quantity: number;
  },
  destLocationId: string,
  count: number,
): Promise<void> {
  // Authoritative quantity from the DB (the caller's copy may be stale).
  const { data: srcRow } = await supabase
    .from('cellar_wines').select('quantity').eq('id', source.id).maybeSingle();
  const srcQtyNow = (srcRow?.quantity as number | undefined) ?? source.quantity ?? 1;
  const n = Math.max(1, Math.min(count, srcQtyNow));

  // 1. Free `n` bottles from the source's current storage.
  let toFree = n - (await removeSlotsForWine(source.id, n));
  if (toFree > 0) {
    const placements = await fetchPlacementsForWine(source.id);
    const external = await fetchExternalLocationIds(
      placements.filter((p) => p.kind === 'location').map((p) => p.storage_location_id));
    const isExt = (p: CellarPlacement) =>
      p.kind === 'location' && !!p.storage_location_id && external.has(p.storage_location_id);
    const take = async (list: CellarPlacement[]) => {
      for (const p of list) {
        if (toFree <= 0) break;
        const t = Math.min(toFree, p.quantity ?? 0);
        if (t > 0) { await decrementPlacement(p.id, t); toFree -= t; }
      }
    };
    // Bins, then home alt cellars other than the destination.
    await take(placements.filter((p) => p.kind === 'bin'));
    await take(placements.filter((p) => p.kind === 'location' && p.storage_location_id !== destLocationId && !isExt(p)));
    // Loose bottles need no freeing — use them before touching an external cellar.
    if (toFree > 0) {
      const after = await fetchPlacementsForWine(source.id);
      const loose = Math.max(0, srcQtyNow - placedCount(after));
      toFree -= Math.min(toFree, loose);
    }
    // Last resort: the wine only remains in an external cellar.
    if (toFree > 0) await take(placements.filter((p) => isExt(p) && p.storage_location_id !== destLocationId));
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

  if (!twin) {
    // First bottles of this wine here — keep them on the source row; we only
    // relocated existing bottles, so the row's total is unchanged.
    await addLocationPlacement(source.id, destLocationId, null, n);
    return;
  }

  const srcQty = srcQtyNow - n;
  if (srcQty > 0) {
    // Partial move: bump the twin's line + total, shed n from the source (row kept).
    await addLocationPlacement(twin.id, destLocationId, null, n);
    const { data: twRow } = await supabase
      .from('cellar_wines').select('quantity').eq('id', twin.id).maybeSingle();
    await supabase.from('cellar_wines')
      .update({ quantity: (twRow?.quantity ?? 0) + n }).eq('id', twin.id);
    await supabase.from('cellar_wines').update({ quantity: srcQty }).eq('id', source.id);
    return;
  }

  // Whole-row move: the source would empty. Deleting it cascades away its removal
  // history, filter memberships and notes/review — so only do that when it has none.
  if (!(await wineRowHasHistory(source.id))) {
    await addLocationPlacement(twin.id, destLocationId, null, n);
    const { data: twRow } = await supabase
      .from('cellar_wines').select('quantity').eq('id', twin.id).maybeSingle();
    await supabase.from('cellar_wines')
      .update({ quantity: (twRow?.quantity ?? 0) + n }).eq('id', twin.id);
    await deleteCellarWine(source.id);
    return;
  }
  // Source has history: land the bottles on the source row, then fold the twin
  // INTO it when the twin is history-free (one consolidated line, history kept).
  // If both carry history, leave two lines rather than lose anything.
  await addLocationPlacement(source.id, destLocationId, null, n);
  if (!(await wineRowHasHistory(twin.id))) await absorbWineRow(source.id, twin.id);
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
  const rows = await selectAllPages<any>((from, to) =>
    supabase
      .from('cellar_wines')
      .select('id, producer, wine_name, vintage, bottle_size_ml, quantity, storage_location_id')
      .eq('user_id', userId)
      .is('archived_at', null)
      .eq('is_wishlist', false)
      .is('awaiting_placement_unit_id', null)
      .not('storage_location_id', 'is', null)
      .order('id', { ascending: true })
      .range(from, to) as any);
  const candidates = rows.filter((r: any) => homeSet.has(r.storage_location_id));
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
  const wines = await selectAllPages<{ id: string; quantity: number }>((from, to) =>
    supabase
      .from('cellar_wines')
      .select('id, quantity')
      .eq('user_id', userId)
      .is('archived_at', null)
      .eq('is_wishlist', false)
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
  const legacyRows = await selectAllPages<{ id: string; quantity: number }>((from, to) =>
    supabase.from('cellar_wines').select('id, quantity')
      .eq('storage_location_id', locationId)
      .order('id', { ascending: true })
      .range(from, to) as any);
  for (const w of legacyRows) {
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
    const wineRows = await selectAllInChunks<{ id: string; quantity: number }>(wineIds, (chunk, from, to) =>
      supabase.from('cellar_wines').select('id, quantity').in('id', chunk)
        .order('id', { ascending: true }).range(from, to) as any);
    const qtyById = new Map(wineRows.map((w) => [w.id, w.quantity ?? 0]));

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
        // Never below what's still placed elsewhere (mirrors trimOrDeleteWineOnUnitDelete).
        await supabase.from('cellar_wines').update({ quantity: Math.max(otherPlaced, remaining, 1) }).eq('id', id);
      }
      onProgress?.(++processed, wineIds.length);
    }
  }

  // Remove the location itself — cascades any remaining placements + storage
  // cases + location filters, and nulls the legacy pointer on kept wines.
  await deleteStorageLocation(locationId);
  return { deletedWines };
}
