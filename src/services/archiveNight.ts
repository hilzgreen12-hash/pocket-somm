import type { CellarWine } from '../types/wine';
import type { DetectedBottle } from '../api/label';
import type { LineupWine } from '../api/lineups';
import { addCellarWine, addCellarWineRemoval, getCellarWineById, updateCellarWine } from '../api/cellar';
import { clearWineFromRacks } from '../api/racks';
import { clearLocationPlacements, releaseBottlesFromPlacements, fetchPlacementsForWine, placedCount } from '../api/placements';
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
      cellar_wine_id: match?.id ?? null,
      archived: false,
      count: b.quantity ?? 1,
    });
  }
  return rows;
}

// Archive `count` bottles of one cellar wine, dated `removeDate` — the same
// outcome as the wine card's remove-bottles action. Returns how many bottles
// were actually archived (0 when the wine is gone or already empty).
//
// The row is re-read rather than trusted from a cache, so two lineup rows linked
// to the same wine each see the quantity the previous one left behind.
//
// Not a single transaction: on a partial removal the archive copy is inserted
// BEFORE the live quantity is decremented, so a failure part-way can at worst
// leave a bottle showing twice (visible and fixable) — never lose one.
export async function archiveBottles(cellarWineId: string, count: number, removeDate: string): Promise<number> {
  const wine = await getCellarWineById(cellarWineId);
  if (!wine || wine.archived_at) return 0;
  const effective = Math.min(count, wine.quantity ?? 0);
  if (effective <= 0) return 0;
  const archivedAt = `${removeDate}T12:00:00.000Z`;

  if (effective >= wine.quantity) {
    // Every bottle goes: archive the row itself, then detach it from ALL storage
    // (rack slots and location placements) so it can't linger as a ghost.
    await updateCellarWine(wine.id, { archived_at: archivedAt } as Partial<CellarWine>);
    await clearWineFromRacks(wine.id);
    await clearLocationPlacements(wine.id);
  } else {
    const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = wine;
    await addCellarWine({ ...rest, quantity: effective, archived_at: archivedAt } as any);
    await updateCellarWine(wine.id, { quantity: wine.quantity - effective });
    // Free the archived bottles from loose stock first, then from placements.
    const unplaced = Math.max(0, wine.quantity - placedCount(await fetchPlacementsForWine(wine.id)));
    const toFree = Math.max(0, effective - unplaced);
    if (toFree > 0) await releaseBottlesFromPlacements(wine.id, toFree);
  }

  await addCellarWineRemoval({ cellarWineId: wine.id, removedAt: removeDate, count: effective });
  return effective;
}
