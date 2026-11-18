import * as Crypto from 'expo-crypto';
import { getCellarContext } from '../api/cellarContext';
import type { ReviewEntry, CellarWine } from '../types/wine';

// A cellar bottle's review is a list of dated entries (migration 080), stored
// on cellar_wines.review_entries in the order they were written. The flat
// review_* fields on the row mirror the LATEST entry for the surfaces that
// still read them (card quick-stats, community posts).

interface ReviewEntryInput {
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

export function entriesOf(wine: Pick<CellarWine, 'review_entries'> | null | undefined): ReviewEntry[] {
  return wine && Array.isArray(wine.review_entries) ? wine.review_entries : [];
}

// A bottle's reviews and personal notes belong to the cellar's owner. A member
// browsing someone else's shared cellar sees the bottles but not those, and
// reviews a wine into their own Wine Reviews instead.
export function isSomeoneElsesBottle(wine: Pick<CellarWine, 'user_id'>): boolean {
  const me = getCellarContext().userId;
  return !!me && wine.user_id !== me;
}

// The review entries this user may see on a bottle (none on someone else's).
export function visibleEntries(wine: Pick<CellarWine, 'user_id' | 'review_entries'>): ReviewEntry[] {
  return isSomeoneElsesBottle(wine) ? [] : entriesOf(wine);
}

// The bottle's review score as this user may see it (null on someone else's).
export function visibleReviewScore(wine: Pick<CellarWine, 'user_id' | 'review_score'>): number | null {
  return isSomeoneElsesBottle(wine) ? null : wine.review_score;
}

// Comparable timestamp for a drinking date. Bare yyyy-mm-dd dates are read at
// local noon so they sort alongside full ISO timestamps on the same day.
export function drinkingDateTime(date: string | null | undefined): number {
  if (!date) return 0;
  const t = new Date(/^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T12:00:00` : date).getTime();
  return Number.isNaN(t) ? 0 : t;
}

// Newest first: by drinking date, then by when the entry was written (so two
// tastings on the same day keep the order they were added).
export function byRecency(entries: ReviewEntry[]): ReviewEntry[] {
  return [...entries].sort((a, b) =>
    drinkingDateTime(b.date) - drinkingDateTime(a.date)
    || new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
}

export function latestEntry(entries: ReviewEntry[]): ReviewEntry | null {
  return byRecency(entries)[0] ?? null;
}

// The flat review_* patch that mirrors the latest entry onto the cellar_wines
// row. Pass null to clear them all (the bottle has no review left).
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

// The cellar_wines patch that removes the given entries from a bottle and
// re-mirrors the flat fields onto whichever entry is now the latest.
export function withoutEntries(wine: CellarWine, entryIds: Iterable<string>): Partial<CellarWine> {
  const drop = new Set(entryIds);
  const remaining = entriesOf(wine).filter((e) => !drop.has(e.id));
  return { review_entries: remaining, ...flatMirror(latestEntry(remaining)) };
}

// Split an entry's "place, city" location back into its two fields. The first
// comma separates them; with no comma the whole string is the place.
export function splitLocation(raw: string | null | undefined): { place: string; city: string } {
  const text = (raw ?? '').trim();
  const idx = text.indexOf(',');
  if (idx === -1) return { place: text, city: '' };
  return { place: text.slice(0, idx).trim(), city: text.slice(idx + 1).trim() };
}
