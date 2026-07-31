import type { ChosenWine, CellarWine } from '../types/wine';
import { isReviewEditable } from './reviewDedup';
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

export interface UnifiedReview {
  source: 'restaurant' | 'other' | 'cellar';
  title: string;
  entries: UnifiedEntry[]; // newest first
  count: number;
  averageScore: number | null; // mean across entries that carry a score
  latestEditable: boolean; // the newest entry is still within its 24h window
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
    entries,
    count: entries.length,
    averageScore: average(entries),
    latestEditable: isReviewEditable(head.reviewed_at),
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
    entries,
    count: entries.length,
    averageScore: average(entries),
    latestEditable: entries.length ? isReviewEditable(entries[0].savedAt) : true,
  };
}
