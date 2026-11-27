// A saved recipe's notes: a dated list, newest first, each one editable or
// removable — like a wine's review entries. Stored as JSON in
// chef_label_sessions.user_notes; a note saved before this (plain text) reads
// as one entry dated when it was last updated.

export interface RecipeNote { id: string; text: string; at: string }

export function parseRecipeNotes(raw: string | null | undefined, fallbackAt?: string | null): RecipeNote[] {
  const t = (raw ?? '').trim();
  if (!t) return [];
  if (t.startsWith('{')) {
    try {
      const v = JSON.parse(t) as { notes?: RecipeNote[] };
      if (Array.isArray(v.notes)) {
        return v.notes
          .filter((n) => n && typeof n.text === 'string' && n.text.trim())
          .sort((a, b) => (b.at ?? '').localeCompare(a.at ?? ''));
      }
    } catch { /* plain text that happens to start with "{" */ }
  }
  return [{ id: 'legacy', text: t, at: fallbackAt ?? new Date().toISOString() }];
}

// null when there are no notes left, so the column clears.
export function serializeRecipeNotes(notes: RecipeNote[]): string | null {
  const kept = notes.filter((n) => n.text.trim());
  return kept.length ? JSON.stringify({ v: 1, notes: kept }) : null;
}

// The newest note's text — for the share card's pairing-note prefill.
export function latestRecipeNote(raw: string | null | undefined): string {
  return parseRecipeNotes(raw)[0]?.text ?? '';
}

export const newNoteId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export function formatNoteDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
