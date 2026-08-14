import type { ChosenWine, CellarWine, VintageAssessment, RarityAssessment } from '../types/wine';
import { byRecency, entriesOf } from './cellarReview';

// One normalized review, so restaurant / cellar / other reviews all render
// through the SAME cards, detail view and average. A review is a body of dated
// entries (newest first); occasion reviews come from grouped chosen_wines rows,
// cellar reviews from a bottle's review_entries list.

export interface UnifiedEntry {
  id: string;
  savedAt: string | null; // immutable 24h edit clock
  dateIso: string | null; // drinking date, for the entry heading
  location: string | null;
  score: number | null;
  favourite: boolean;
  note: string | null; // "Your Review"
  personalNotes: string | null;
  drinkingWindow: string | null;
}

// Vinster's own take on the wine, shown collapsed under "View Vinster's Note" on
// the review card (kept out of the user's OWN review area). The sommelier note
// (rationale) is fetched on demand when saved-empty; the rest is whatever was
// captured on the wine at save time.
export interface VinsterIntel {
  criticScore: number | null;
  vintageAssessment: VintageAssessment | null;
  rarityAssessment: RarityAssessment | null;
  rationale: string | null;
}

export interface UnifiedReview {
  source: 'restaurant' | 'other' | 'cellar';
  title: string;
  // Structured identity so the review header can render the app-wide format
  // (Producer · Name · Vintage / Region / Grape) instead of the flat `title`.
  producer: string | null;
  wineName: string | null;
  vintage: string | number | null;
  region: string | null;
  grape: string | null;
  entries: UnifiedEntry[]; // newest first
  count: number;
  averageScore: number | null; // mean across entries that carry a score
  latestEditable: boolean; // the newest entry is editable (the time lock is gone)
  vinsterIntel: VinsterIntel;
}

function average(entries: UnifiedEntry[]): number | null {
  const scores = entries.map((e) => e.score).filter((s): s is number => s != null);
  if (!scores.length) return null;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function titleOf(producer: string | null, name: string | null, vintage: string | number | null): string {
  return [producer, name, vintage ? String(vintage) : null].filter(Boolean).join(', ');
}

// Occasion review: a group of chosen_wines rows (Phase 1), newest first.
export function fromChosenGroup(rows: ChosenWine[]): UnifiedReview {
  const ordered = [...rows].sort((a, b) => new Date(b.chosen_at).getTime() - new Date(a.chosen_at).getTime());
  const head = ordered[0];
  const entries: UnifiedEntry[] = ordered.map((r) => ({
    id: r.id,
    savedAt: r.reviewed_at,
    dateIso: r.chosen_at,
    location: [r.restaurant_name, r.city].map((s) => (s ?? '').trim()).filter(Boolean).join(', ') || null,
    score: r.user_score,
    favourite: r.is_favourite,
    note: r.tasting_note,
    personalNotes: r.other_observations,
    drinkingWindow: r.user_drinking_window,
  }));
  return {
    source: head.source === 'other' ? 'other' : 'restaurant',
    title: titleOf(head.producer, head.wine_name, head.vintage),
    producer: head.producer ?? null,
    wineName: head.wine_name ?? null,
    vintage: head.vintage ?? null,
    region: head.region ?? null,
    grape: head.grape ?? null,
    entries,
    count: entries.length,
    averageScore: average(entries),
    // The 24h lock is gone — the latest entry is always editable (older appended
    // entries stay read-only reflections, gated in the UI by index).
    latestEditable: true,
    vinsterIntel: {
      criticScore: head.critic_score ?? null,
      vintageAssessment: head.vintage_assessment ?? null,
      rarityAssessment: head.rarity_assessment ?? null,
      rationale: head.rationale ?? null,
    },
  };
}

// Cellar review: a bottle's review_entries (Phase 2), newest first.
export function fromCellar(wine: CellarWine): UnifiedReview {
  const ordered = byRecency(entriesOf(wine));
  const entries: UnifiedEntry[] = ordered.map((e) => ({
    id: e.id,
    savedAt: e.savedAt,
    dateIso: e.date,
    location: e.location,
    score: e.score,
    favourite: wine.is_favourite, // cellar favourite is per bottle, not per entry
    note: e.note,
    personalNotes: e.personalNotes,
    drinkingWindow: e.drinkingWindow,
  }));
  return {
    source: 'cellar',
    title: titleOf(wine.producer, wine.wine_name, wine.vintage),
    producer: wine.producer ?? null,
    wineName: wine.wine_name ?? null,
    vintage: wine.vintage ?? null,
    region: wine.region ?? null,
    grape: wine.grape_variety ?? null,
    entries,
    count: entries.length,
    averageScore: average(entries),
    latestEditable: true,
    vinsterIntel: {
      criticScore: wine.critic_score ?? null,
      vintageAssessment: null,
      rarityAssessment: null,
      rationale: null,
    },
  };
}
