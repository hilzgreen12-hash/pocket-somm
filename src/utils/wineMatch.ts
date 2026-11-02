// Shared wine-identity matcher — unifies the cellar archive (and manual-add
// dedup) with the #91 review matcher. Both ask the SAME question: "are these
// two rows the same wine?" so they share ONE predicate here rather than each
// rolling a weaker exact-string compare. The predicate mirrors
// reviewDedup.findExistingReview: same (normalised) vintage AND
// (ws_wine_id equal when both present | wineNameKey equal | looseWineMatch).
//
// Dependency-light on purpose: imports only from wineIdentity.ts.

import { wineNameKey, looseWineMatch } from './wineIdentity';

function norm(s: string | null | undefined): string {
  return (s ?? '').trim().toLowerCase();
}

// Tolerant accessor — rows come from the cellar (wine_name) or from review-style
// callers (wineName), so accept either field name for the cuvée name.
export interface WineLike {
  producer?: string | null;
  wine_name?: string | null;
  wineName?: string | null;
  vintage?: string | number | null;
  ws_wine_id?: string | null;
}

function nameOf(w: WineLike): string | null | undefined {
  return w.wine_name ?? w.wineName;
}

// True when a and b are the same wine, using the SAME criterion as
// findExistingReview: normalise vintage on both sides and require equal, then
// match on Wine-Searcher id (when both carry one), else an order-independent
// name-token key, else a looser vintage-gated subset fallback.
export function sameWineIdentity(a: WineLike, b: WineLike): boolean {
  const va = norm(a.vintage != null ? String(a.vintage) : '');
  const vb = norm(b.vintage != null ? String(b.vintage) : '');
  if (va !== vb) return false;

  const idA = a.ws_wine_id ?? null;
  const idB = b.ws_wine_id ?? null;
  if (idA != null && idB != null && idA === idB) return true;

  const keyA = wineNameKey(a.producer, nameOf(a));
  const keyB = wineNameKey(b.producer, nameOf(b));
  if (keyA && keyB && keyA === keyB) return true;

  return looseWineMatch(
    { producer: a.producer, wineName: nameOf(a), vintage: a.vintage },
    { producer: b.producer, wineName: nameOf(b), vintage: b.vintage },
  );
}

export interface WineGroup<T> {
  rep: T;
  rows: T[];
  totalQuantity: number;
}

function quantityOf(row: any): number {
  const q = Number(row?.quantity);
  return Number.isFinite(q) ? q : 0;
}

// Greedy clustering: each row joins the first existing group whose
// representative is the same wine, else opens a new group. Greedy (not
// transitive) is fine and mirrors the add-time dedup. The rep is the FIRST row
// of each group; totalQuantity sums the members' quantity.
export function groupWinesByIdentity<T extends WineLike>(rows: T[]): WineGroup<T>[] {
  const groups: WineGroup<T>[] = [];
  for (const row of rows) {
    const g = groups.find((grp) => sameWineIdentity(row, grp.rep));
    if (g) {
      g.rows.push(row);
      g.totalQuantity += quantityOf(row);
    } else {
      groups.push({ rep: row, rows: [row], totalQuantity: quantityOf(row) });
    }
  }
  return groups;
}
