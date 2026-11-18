import type { CellarWine } from '../types/wine';

// Wines with at least one bottle at HOME — not held in an external (offsite)
// cellar. A wine split between home and an external cellar counts.
export function homeOnlyWines<T extends Pick<CellarWine, 'id' | 'quantity'>>(
  wines: T[],
  placements: { kind: string; cellar_wine_id: string; storage_location_id?: string | null; quantity?: number | null }[],
  externalIds: Set<string>,
): T[] {
  if (externalIds.size === 0) return wines;
  const extByWine = new Map<string, number>();
  for (const p of placements) {
    if (p.kind === 'location' && p.storage_location_id && externalIds.has(p.storage_location_id)) {
      extByWine.set(p.cellar_wine_id, (extByWine.get(p.cellar_wine_id) ?? 0) + (p.quantity ?? 0));
    }
  }
  return wines.filter((w) => (w.quantity ?? 0) - (extByWine.get(w.id) ?? 0) > 0);
}
