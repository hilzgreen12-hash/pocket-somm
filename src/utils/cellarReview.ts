import * as Crypto from 'expo-crypto';
import type { ReviewEntry, CellarWine } from '../types/wine';
import { isReviewEditable } from './reviewDedup';

// A cellar bottle's review is an append-only list of dated entries (migration
// 080), stored on cellar_wines.review_entries. Storage order is newest-last; the
// helpers below present newest-first for display. The flat review_* fields on
// the row mirror the LATEST entry so existing surfaces keep working unchanged.

export interface ReviewEntryInput {
  note: string;
  personalNotes: string;
  score: number | null;
  location: string;
  date: string | null; // yyyy-mm-dd drinking date
  drinkingWindow: string;
}

export function buildEntry(input: ReviewEntryInput): ReviewEntry {
  return {
    id: Crypto.randomUUID(),
    savedAt: new Date().toISOString(),
    date: input.date || null,
    location: input.location.trim() || null,
    score: input.score,
    note: input.note.trim() || null,
    personalNotes: input.personalNotes.trim() || null,
    drinkingWindow: input.drinkingWindow.trim() || null,
  };
}

export function entriesOf(wine: CellarWine | null | undefined): ReviewEntry[] {
  return wine && Array.isArray(wine.review_entries) ? wine.review_entries : [];
}

// Newest first, for display.
export function byRecency(entries: ReviewEntry[]): ReviewEntry[] {
  return [...entries].sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
}

export function latestEntry(entries: ReviewEntry[]): ReviewEntry | null {
  return byRecency(entries)[0] ?? null;
}

export function isEntryEditable(entry: ReviewEntry | null | undefined): boolean {
  return isReviewEditable(entry?.savedAt);
}

// The flat review_* patch that mirrors the latest entry onto the cellar_wines
// row so existing displays (Your Wine Reviews derivation, card quick-stats,
// community posts, identity-mirror sync) keep reading the current review.
export function flatMirror(latest: ReviewEntry | null): Partial<CellarWine> {
  return {
    review_note: latest?.note ?? null,
    user_notes: latest?.personalNotes ?? null,
    review_score: latest?.score ?? null,
    review_location: latest?.location ?? null,
    review_date: latest?.date ?? null,
    user_drinking_window: latest?.drinkingWindow ?? null,
  };
}
