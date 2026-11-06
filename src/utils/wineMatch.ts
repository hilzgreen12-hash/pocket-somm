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

function nameOf(w: WineLike): string | null | undefined {
  return w.wine_name ?? w.wineName;
}

// The name with a producer-repeating name read as the region's appellation
// ("Il Marroneto" / "Il Marroneto" → "Brunello di Montalcino"). Used ONLY for an
// EXACT key match below — never the loose subset match, which would fold a
// self-named château ("Château Latour" → "Pauillac") into its "Le Pauillac de
// Château Latour" (the key keeps "de", so exact keys stay distinct).
function appellationName(w: WineLike): string | null | undefined {
  const n = nameOf(w);
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

  // Producer-only name on one side ("Il Marroneto" / "Il Marroneto", region
  // Brunello…) vs the full wine ("Marroneto" / "Brunello di Montalcino").
  const appA = wineNameKey(a.producer, appellationName(a));
  const appB = wineNameKey(b.producer, appellationName(b));
  if (appA && appB && (appA === keyB || keyA === appB || appA === appB) && (appA !== keyA || appB !== keyB)) return true;

  // Grape deliberately NOT passed: with it a producer-only row ("Domaine Jamet"
  // + Syrah) would subset-match any same-grape cuvée ("Jamet Côte-Rôtie").
  return looseWineMatch(
    { producer: a.producer, wineName: nameOf(a), vintage: a.vintage },
    { producer: b.producer, wineName: nameOf(b), vintage: b.vintage },
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
