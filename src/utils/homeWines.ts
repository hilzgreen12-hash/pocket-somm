import type { CellarWine } from '../types/wine';

// Wines with at least one bottle at HOME — not held in an external (offsite)
// cellar. A wine split between home and an external cellar counts; one filed
// the legacy way straight onto an external cellar (storage_location_id, no
// placements) doesn't.
export function homeOnlyWines<T extends Pick<CellarWine, 'id' | 'quantity' | 'storage_location_id'>>(
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
  return wines.filter((w) => {
    const ext = extByWine.get(w.id) ?? 0;
    if (!!w.storage_location_id && externalIds.has(w.storage_location_id) && ext === 0) return false;
    return (w.quantity ?? 0) - ext > 0;
  });
}
