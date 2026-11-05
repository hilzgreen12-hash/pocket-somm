// Shared wine-identity matcher — unifies the cellar archive (and manual-add
// dedup) with the #91 review matcher. Both ask the SAME question: "are these
// two rows the same wine?" so they share ONE predicate here rather than each
// rolling a weaker exact-string compare. The predicate mirrors
// reviewDedup.findExistingReview: same (normalised) vintage AND
// (ws_wine_id equal when both present | wineNameKey equal | looseWineMatch).
//
// Dependency-light on purpose: imports only from wineIdentity.ts.

import { wineNameKey, looseWineMatch, lookupWineName } from './wineIdentity';

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
  region?: string | null;
  grape_variety?: string | null;
}

// The cuvée name, with a name that merely repeats the producer ("Il Marroneto"
// / "Il Marroneto") read as the appellation from the region ("Brunello di
// Montalcino"), so a producer-only scan matches the full wine.
function nameOf(w: WineLike): string | null | undefined {
  const n = w.wine_name ?? w.wineName;
  return lookupWineName(w.producer, n, w.region) || n;
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
    { producer: a.producer, wineName: nameOf(a), grape: a.grape_variety, vintage: a.vintage },
    { producer: b.producer, wineName: nameOf(b), grape: b.grape_variety, vintage: b.vintage },
  );
}

// THE "do you already own this?" lookup every add path uses (scan → rack / bin
// / location, Lineup, voice, manual): the active (not archived, not wishlist)
// cellar row that is the same wine — and, when sizeMl is given, the same bottle
// format (a magnum is its own line). One rule everywhere, so "Il Marroneto
// Brunello 2016" added to a bin finds "Marroneto Brunello 2016" in a rack.
export function findSameCellarWine<T extends WineLike & { archived_at?: string | null; is_wishlist?: boolean | null; bottle_size_ml?: number | null }>(
  wines: readonly T[] | null | undefined,
  candidate: WineLike,
  sizeMl?: number | null,
): T | undefined {
  return (wines ?? []).find((w) => !w.archived_at && !w.is_wishlist
    && (sizeMl == null || (w.bottle_size_ml ?? 750) === sizeMl)
    && sameWineIdentity(candidate, w));
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
