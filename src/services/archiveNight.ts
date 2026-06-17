import type { CellarWine } from '../types/wine';
import type { DetectedBottle } from '../api/label';
import { addCellarWine, addCellarWineRemoval, updateCellarWine } from '../api/cellar';
import { clearWineFromRacks, removeSlotsForWine } from '../api/racks';

export interface NightMatch {
  wine: CellarWine;
  count: number;            // how many of this wine were detected in the lineup
  anyUnconfident: boolean;  // at least one matched detection was a low-confidence read
}

export interface NightMatchResult {
  matched: NightMatch[];
  // Bottles Vinster read but couldn't find in the live cellar.
  unmatched: DetectedBottle[];
}

const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();

// Match each detected bottle to a live cellar wine by producer + name (+ vintage
// when both have one), then aggregate duplicates into per-wine counts. Bottles
// with no cellar match are returned separately so the UI can say "not in your
// cellar" rather than inventing a removal.
export function matchLineupToCellar(detected: DetectedBottle[], cellar: CellarWine[]): NightMatchResult {
  const byWineId = new Map<string, NightMatch>();
  const unmatched: DetectedBottle[] = [];

  for (const b of detected) {
    const dProducer = norm(b.producer);
    const dName = norm(b.wineName);
    const dVintage = (b.vintage ?? '').trim();

    // Candidate cellar wines whose producer or name lines up. Producer match is
    // the anchor; the name must also match unless the producer IS the name.
    const candidates = cellar.filter((w) => {
      const wProducer = norm(w.producer);
      const wName = norm(w.wine_name);
      const producerHit = !!dProducer && (wProducer === dProducer || wName === dProducer);
      const nameHit = !!dName && (wName === dName || wProducer === dName);
      return producerHit || nameHit;
    });

    // Prefer an exact vintage match when the detection has a vintage.
    let match: CellarWine | undefined;
    if (dVintage) {
      match = candidates.find((w) => (w.vintage ?? '').trim() === dVintage);
    }
    if (!match) match = candidates[0];

    if (!match) { unmatched.push(b); continue; }

    const existing = byWineId.get(match.id);
    if (existing) {
      existing.count += 1;
      existing.anyUnconfident = existing.anyUnconfident || !b.confident;
    } else {
      byWineId.set(match.id, { wine: match, count: 1, anyUnconfident: !b.confident });
    }
  }

  return { matched: Array.from(byWineId.values()), unmatched };
}

// Archive `count` bottles of one cellar wine — mirroring the wine card's
// remove-bottles logic: log the removal event, then either fully archive the
// row (count clears the cellar) or decrement and clone an archive row for the
// bottles pulled. Frees the matching number of rack slots either way.
export async function archiveBottles(wine: CellarWine, count: number, removeDate: string): Promise<void> {
  const effective = Math.min(count, wine.quantity);
  if (effective <= 0) return;
  const archivedAt = `${removeDate}T12:00:00.000Z`;

  await addCellarWineRemoval({ cellarWineId: wine.id, removedAt: removeDate, count: effective });

  const newQuantity = wine.quantity - effective;
  if (newQuantity <= 0) {
    await updateCellarWine(wine.id, { quantity: effective, archived_at: archivedAt } as any);
    await clearWineFromRacks(wine.id);
  } else {
    await updateCellarWine(wine.id, { quantity: newQuantity } as any);
    const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = wine as any;
    await addCellarWine({ ...rest, quantity: effective, archived_at: archivedAt, is_wishlist: false } as any);
    await removeSlotsForWine(wine.id, effective);
  }
}
