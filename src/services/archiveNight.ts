import type { CellarWine } from '../types/wine';
import type { DetectedBottle } from '../api/label';
import type { LineupWine } from '../api/lineups';
import {
  addCellarWine, addCellarWineRemoval, deleteCellarWine, findCellarWineByIdentity, getCellarWineById, getCellarWines,
  takeBackCellarWineRemovals, updateCellarWine,
} from '../api/cellar';
import { assertCanEditCellar } from '../api/cellarContext';
import { clearWineFromRacks } from '../api/racks';
import { clearAppPlacementsForWine, fetchPlacementsForWines, type StorageUnitRef } from '../api/placements';
import { fetchStorageLocations } from '../api/storageLocations';
import { releaseLeavingBottles } from './moveBottles';
import { entriesOf, flatMirror, latestEntry } from '../utils/cellarReview';
import { isoToYmd, todayYmd, ymdToIso } from '../utils/reviewDate';
import { looseWineMatch } from '../utils/wineIdentity';
import { findSameCellarWine, sameWineIdentity } from '../utils/wineMatch';

// Glossary — "archive" means two different things around Lineups:
//  • archiving a BOTTLE moves it out of the live cellar into the cellar archive
//    (cellar_wines.archived_at). That's archiveBottles below; LineupWine.archived
//    records that it was done for a lineup row.
//  • a lineup "archive" is a saved lineup (a lineup_archives row: photo, wines,
//    note). "Archive a Night" is the capture flow that creates one — it never
//    removes bottles from the cellar by itself.

// Turn a lineup detection into the rows stored on the lineup, in the photo's
// left-to-right order. Each row keeps the DETECTED identity; cellar_wine_id
// links it to a cellar wine only when that wine is the same wine AND vintage
// (findSameCellarWine — a producer-only or name-only resemblance never links,
// so archiving can't touch the wrong bottle). Repeat bottles of one wine
// collapse into a single row with a count.
export function buildLineupWines(detected: DetectedBottle[], cellar: CellarWine[]): LineupWine[] {
  const rows: LineupWine[] = [];
  for (const b of detected) {
    const identity = { producer: b.producer || null, wineName: b.wineName ?? '', vintage: b.vintage || null, region: b.region ?? null };
    const match = findSameCellarWine(cellar, identity);
    const sameAs = (r: LineupWine) => (match
      ? r.cellar_wine_id === match.id
      : !r.cellar_wine_id && sameWineIdentity(identity, { producer: r.producer, wineName: r.wine_name, vintage: r.vintage }));
    const existing = rows.find(sameAs);
    if (existing) { existing.count += b.quantity ?? 1; continue; }
    rows.push({
      producer: identity.producer,
      wine_name: identity.wineName,
      vintage: identity.vintage,
      // Keep what the label read gave beyond the name ("Pomerol, Bordeaux",
      // Merlot, Red), so the lineup row shows where the wine is from.
      region: b.region?.trim() || null,
      grape: b.grape?.trim() || null,
      style: b.style?.trim() || null,
      cellar_wine_id: match?.id ?? null,
      archived: false,
      count: b.quantity ?? 1,
    });
  }
  return rows;
}

// The longest Archive Note (where or with whom the bottles were drunk).
export const ARCHIVE_NOTE_MAX = 35;

// The day an archive is dated: `ymd` (YYYY-MM-DD, the user's own day), or today
// when that isn't a readable date.
function archiveDay(ymd: string): string {
  return ymdToIso(ymd) ? ymd.trim() : todayYmd();
}

// When an archive dated `ymd` is stored: local noon, so it reads as that day in
// any time zone.
export function archiveDateIso(ymd: string): string {
  return ymdToIso(archiveDay(ymd))!;
}

// Archive `count` bottles of one cellar wine, dated `removeDate` (YYYY-MM-DD;
// today if unreadable) — the one archive step every screen uses. Returns how
// many bottles were archived (0 when the wine is gone or already empty) and the
// id of the archived row that holds them: the wine itself when every bottle
// went, else the new archive copy.
//
// The row is re-read rather than trusted from a cache, so two lineup rows linked
// to the same wine each see the quantity the previous one left behind.
//
// Not a single transaction: on a partial removal the archive copy is inserted
// BEFORE the live quantity is decremented, so a failure part-way can at worst
// leave a bottle showing twice (visible and fixable) — never lose one.
//
// `fromUnit`: the storage unit the action started from (its bottles go first).
// `note`: where or with whom they were drunk — the archived row's Archive Note,
// and the note on the removal log entry.
export async function archiveBottles(
  cellarWineId: string,
  count: number,
  removeDate: string,
  opts?: { fromUnit?: StorageUnitRef; note?: string },
): Promise<{ archived: number; archivedWineId: string | null }> {
  const wine = await getCellarWineById(cellarWineId);
  if (!wine || wine.archived_at) return { archived: 0, archivedWineId: null };
  const effective = Math.min(count, wine.quantity ?? 0);
  if (effective <= 0) return { archived: 0, archivedWineId: null };
  const day = archiveDay(removeDate);
  const note = opts?.note?.trim().slice(0, ARCHIVE_NOTE_MAX) || null;
  // An archive record is history, not a bottle in storage, so it carries no
  // storage pointers — otherwise deleting a location "& wines" would take the
  // record with it.
  const archived = {
    archived_at: archiveDateIso(day),
    archive_note: note,
    storage_location_id: null, case_id: null, bin_cell_id: null,
    awaiting_placement: false, awaiting_placement_unit_id: null,
  };
  let archivedWineId: string;

  if (effective >= wine.quantity) {
    // Every bottle goes: archive the row itself, then detach it from ALL storage
    // (rack slots, bin cells and alt cellars, external ones included) so it can't
    // linger as a ghost.
    await updateCellarWine(wine.id, archived);
    await clearWineFromRacks(wine.id);
    await clearAppPlacementsForWine(wine.id, { keepExternal: false });
    archivedWineId = wine.id;
  } else {
    // The copy starts with no review: the wine's reviews stay on the live row,
    // and a copy of them here would drift from the original once either is edited.
    const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = wine;
    const copy = await addCellarWine({ ...rest, ...archived, ...flatMirror(null), review_entries: [], quantity: effective });
    archivedWineId = copy.id;
    // Free the archived bottles' storage before the quantity drops (see
    // releaseLeavingBottles for why the order matters).
    await releaseLeavingBottles(wine.id, wine.quantity, effective, opts?.fromUnit);
    await updateCellarWine(wine.id, { quantity: wine.quantity - effective });
  }

  await addCellarWineRemoval({ cellarWineId: wine.id, removedAt: day, count: effective, note });
  return { archived: effective, archivedWineId };
}

// Return to Cellar — undo an archive. The archived row's bottles come back as
// unplaced bottles (loose in Your Cellar List, ready to place). When the cellar
// still holds the same wine, vintage and bottle size they join that line — its
// count grows, any reviews only the archive row holds move onto it, and the
// archive row is deleted; otherwise the archive row simply becomes live again.
// The removal log entry for those bottles is taken back. Returns how many
// bottles came back and the live row that now holds them.
export async function returnToCellar(archivedWineId: string): Promise<{ returned: number; cellarWineId: string }> {
  assertCanEditCellar();
  const archived = await getCellarWineById(archivedWineId);
  if (!archived?.archived_at) throw new Error('This wine is no longer in your archive. Pull to refresh and try again.');
  const returned = archived.quantity ?? 0;
  const day = isoToYmd(archived.archived_at);
  const live = await findCellarWineByIdentity(archived.user_id, archived, archived.bottle_size_ml ?? 750);

  if (live) {
    // The live count rises before the archive row goes, so a failure in between
    // shows the bottles twice (visible and fixable) rather than losing them.
    await updateCellarWine(live.id, { quantity: (live.quantity ?? 0) + returned, ...reviewsOnlyIn(archived, live) });
    await deleteCellarWine(archived.id);
  } else {
    await updateCellarWine(archived.id, { archived_at: null, archive_note: null });
  }
  // History only (nothing reads it back to count bottles), so a failure here
  // doesn't undo a return that has already happened.
  await takeBackCellarWineRemovals(archived, live ? [live.id] : [], day, returned)
    .catch((err) => console.warn('[returnToCellar] removal log not taken back:', err));
  return { returned, cellarWineId: live?.id ?? archived.id };
}

// The review patch that adds `from`'s review entries missing on `into` (matched
// by id: older archive copies carry copies of the live row's entries). Empty
// when there's nothing to add.
function reviewsOnlyIn(from: CellarWine, into: CellarWine): Partial<CellarWine> {
  const have = new Set(entriesOf(into).map((e) => e.id));
  const extra = entriesOf(from).filter((e) => !have.has(e.id));
  if (!extra.length) return {};
  const merged = [...entriesOf(into), ...extra];
  return { review_entries: merged, ...flatMirror(latestEntry(merged)) };
}

// ── "This wine exists in your cellar" ───────────────────────────────────────
// Used after a wine review is saved: find the reviewed wine's live bottles in
// the cellar so Vinster can offer to archive one (the user has just drunk it).
// Matches the same wine AND vintage — an exact identity first, then the looser
// word-subset rule (a label read as "Stella di Campalto Rosa" still finds the
// cellar's "Stella di Campalto Brunello di Montalcino Rosa").

export interface CellarHolding {
  wine: CellarWine;
  home: number;      // bottles in Home Storage (racks, bins, fridges, home alt cellars, unplaced)
  external: number;  // bottles in External Storage (alt cellars marked external)
}

export async function findCellarHoldings(
  userId: string,
  identity: { producer: string | null; wineName: string | null; vintage: string | number | null },
): Promise<CellarHolding[]> {
  const vintage = identity.vintage == null ? '' : String(identity.vintage).trim();
  if (!vintage) return [];
  const [wines, locations] = await Promise.all([getCellarWines(userId), fetchStorageLocations(userId)]);
  const candidate = { producer: identity.producer, wine_name: identity.wineName ?? '', vintage };
  const exact = wines.filter((w) => sameWineIdentity(candidate, w));
  const matches = exact.length ? exact : wines.filter((w) => looseWineMatch(
    { producer: identity.producer, wineName: identity.wineName, vintage },
    { producer: w.producer, wineName: w.wine_name, grape: w.grape_variety, vintage: w.vintage },
  ));
  if (!matches.length) return [];
  const externalIds = new Set(locations.filter((l) => l.is_external).map((l) => l.id));
  const placements = await fetchPlacementsForWines(matches.map((w) => w.id));
  return matches
    .filter((w) => (w.quantity ?? 0) > 0)
    .map((w) => {
      const external = placements
        .filter((p) => p.cellar_wine_id === w.id && p.kind === 'location' && p.storage_location_id && externalIds.has(p.storage_location_id))
        .reduce((n, p) => n + (p.quantity ?? 0), 0);
      return { wine: w, home: Math.max(0, (w.quantity ?? 0) - external), external };
    });
}
