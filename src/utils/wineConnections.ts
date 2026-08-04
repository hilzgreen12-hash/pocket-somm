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

// Normalize for identity matching, tolerant of the formatting differences that
// crop up between a label scan and a list scan of the SAME wine: strip
// diacritics ("Château" == "Chateau"), drop any 4-digit vintage embedded in the
// name (we match vintage-agnostically anyway, so "Barolo Ravera 2019" ==
// "Barolo Ravera"), fold punctuation to spaces, collapse and trim.
const norm = (s: string | null | undefined) => (s ?? '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/\b(?:19|20)\d{2}\b/g, ' ')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

// Order- and field-placement-independent identity key. A label scan and a list
// scan of the same wine often split producer vs name differently (or repeat the
// producer inside the name), so we match on the SET of significant words across
// BOTH fields: same words in any order/placement → same wine; different words →
// different wine (kept conservative so distinct cuvées don't merge).
export function wineNameKey(producer: string | null | undefined, wineName: string | null | undefined): string {
  const tokens = norm(`${producer ?? ''} ${wineName ?? ''}`).split(' ').filter(Boolean);
  return Array.from(new Set(tokens)).sort().join(' ');
}

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
  // Cross-linking is anchored SOLELY to the Wine-Searcher id — the registry-
  // backed, authoritative identity. The old normalized-name fallback is gone: it
  // linked (and mis-linked) on shared words and never linked reliably. A wine
  // with no id (Wine-Searcher can't identify it) intentionally shows no
  // connections rather than risk a wrong one. Older rows are stamped with their
  // id by the one-off backfill (services/backfillWsIds.ts); every new scan
  // captures it at input.
  if (!wantId) return EMPTY_CONNECTIONS;

  const wantVintage = identity.vintage != null ? String(identity.vintage).trim() : '';

  const matches = (recId: string | null | undefined) => recId != null && recId === wantId;

  const labels = (data.labels ?? []).filter(
    (l) => matches(l.ws_wine_id) && l.id !== opts?.excludeLabelId,
  );
  const cellarWines = (data.cellarWines ?? []).filter(
    (w) => matches(w.ws_wine_id) && w.id !== opts?.excludeCellarId,
  );
  const restaurantPicks = (data.chosenWines ?? []).filter(
    (w) => matches(w.ws_wine_id) && w.id !== opts?.excludeChosenId,
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
