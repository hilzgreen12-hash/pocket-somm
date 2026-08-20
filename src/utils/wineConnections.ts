import type { LibraryLabel, CellarWine, ChosenWine } from '../types/wine';
import { entriesOf } from './cellarReview';

// One wine identity ties together every place a wine shows up: its label(s) in
// the library, cellar bottles, restaurant picks and reviews. This resolver
// gathers those connections for a given identity so the Wine Intel screen, the
// Label Library and the review/cellar cards can cross-link to each other.
//
// Matching is vintage-AGNOSTIC — keyed on normalized producer + name — so
// "you've had this wine" connects even across vintages; `vintageMismatch` flags
// when a match is a different vintage than the wine in hand.

// The identity-matching key lives in a dependency-free module (wineIdentity)
// so reviewDedup and the chosen-wines API can share it without an import
// cycle. Re-exported so existing importers of wineNameKey here keep working.
export { wineNameKey } from './wineIdentity';
import { wineNameKey as _wineNameKey } from './wineIdentity';

// A chosen_wines row counts as reviewed once it carries any review content
// (mirrors the predicate in app/wines/chosen.tsx).
function chosenHasReview(w: ChosenWine): boolean {
  return !!(
    (w.tasting_note && w.tasting_note.trim()) ||
    (w.other_observations && w.other_observations.trim()) ||
    w.user_score != null
  );
}

export interface WineConnections {
  labels: LibraryLabel[];
  cellarWines: CellarWine[];       // matching cellar bottles (owned or wishlist)
  restaurantPicks: ChosenWine[];   // matching chosen_wines (restaurant / other), reviewed or awaiting
  reviewedChosen: ChosenWine[];    // subset of chosen_wines that carry a review
  reviewedCellar: CellarWine[];    // matching cellar bottles that carry review_entries
  averageScore: number | null;     // mean of every review score found
  reviewCount: number;             // distinct review groups + reviewed cellar bottles
  lastReviewedIso: string | null;  // most recent review date across all sources
  vintageMismatch: boolean;        // a match exists but of a different vintage
  hasAny: boolean;                 // any connection at all
}

export const EMPTY_CONNECTIONS: WineConnections = {
  labels: [], cellarWines: [], restaurantPicks: [], reviewedChosen: [], reviewedCellar: [],
  averageScore: null, reviewCount: 0, lastReviewedIso: null, vintageMismatch: false, hasAny: false,
};

export function findWineConnections(
  identity: { producer: string | null; wineName: string | null | undefined; vintage: string | number | null; wsWineId?: string | null },
  data: { labels?: LibraryLabel[]; chosenWines?: ChosenWine[]; cellarWines?: CellarWine[] },
  opts?: { excludeChosenId?: string; excludeLabelId?: string; excludeCellarId?: string },
): WineConnections {
  const wantId = identity.wsWineId ?? null;
  // Cross-linking prefers the Wine-Searcher id — the registry-backed, authoritative
  // identity: when BOTH sides carry an id we trust it (equal = same wine). But
  // OBSCURE wines Wine-Searcher can't identify have no id on either side, so an
  // id-only match left them permanently disconnected (a reviewed label still read
  // "awaiting review"). So when either side lacks an id, fall back to a STRICT
  // name-identity key (accent/article/word-order tolerant, vintage stripped) — the
  // same wineNameKey the cellar/lineup matching uses, not the old loose substring.
  const wantKey = _wineNameKey(identity.producer, identity.wineName ?? null);
  if (!wantId && !wantKey) return EMPTY_CONNECTIONS;

  const wantVintage = identity.vintage != null ? String(identity.vintage).trim() : '';

  const matches = (rec: { ws_wine_id?: string | null; producer?: string | null; wine_name?: string | null }) => {
    const rid = rec.ws_wine_id ?? null;
    if (wantId && rid) return wantId === rid;                 // both registry-identified
    return !!wantKey && _wineNameKey(rec.producer, rec.wine_name) === wantKey;
  };

  const labels = (data.labels ?? []).filter(
    (l) => matches(l) && l.id !== opts?.excludeLabelId,
  );
  const cellarWines = (data.cellarWines ?? []).filter(
    (w) => matches({ ws_wine_id: w.ws_wine_id, producer: w.producer, wine_name: w.wine_name }) && w.id !== opts?.excludeCellarId,
  );
  const restaurantPicks = (data.chosenWines ?? []).filter(
    (w) => matches(w) && w.id !== opts?.excludeChosenId,
  );

  const reviewedChosen = restaurantPicks.filter(chosenHasReview);
  const reviewedCellar = cellarWines.filter((w) => entriesOf(w).length > 0);

  const scores: number[] = [];
  reviewedChosen.forEach((w) => { if (w.user_score != null) scores.push(w.user_score); });
  reviewedCellar.forEach((w) => entriesOf(w).forEach((e) => { if (e.score != null) scores.push(e.score); }));
  const averageScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  // Distinct reviews = grouped chosen reviews (by review_group_id) + each
  // reviewed cellar bottle.
  const groups = new Set(reviewedChosen.map((w) => w.review_group_id ?? w.id));
  const reviewCount = groups.size + reviewedCellar.length;

  // Most recent review date across chosen (chosen_at) and cellar entries.
  let lastReviewedIso: string | null = null;
  const noteDate = (iso: string | null | undefined) => {
    if (iso && (!lastReviewedIso || new Date(iso).getTime() > new Date(lastReviewedIso).getTime())) lastReviewedIso = iso;
  };
  reviewedChosen.forEach((w) => noteDate(w.chosen_at));
  reviewedCellar.forEach((w) => entriesOf(w).forEach((e) => noteDate(e.date ?? e.savedAt)));

  const vintages = [
    ...labels.map((l) => l.vintage),
    ...cellarWines.map((w) => w.vintage),
    ...restaurantPicks.map((w) => w.vintage),
  ];
  const vintageMismatch = wantVintage !== '' && vintages.some((v) => v != null && String(v).trim() !== wantVintage);

  const hasAny = labels.length > 0 || cellarWines.length > 0 || restaurantPicks.length > 0;

  return {
    labels, cellarWines, restaurantPicks, reviewedChosen, reviewedCellar,
    averageScore, reviewCount, lastReviewedIso, vintageMismatch, hasAny,
  };
}
