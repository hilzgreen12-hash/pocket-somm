// The jokey placeholder the app/edge-function shows when no real "Inside Line"
// was produced. Kept in ONE place so the client can DETECT it — a wine whose
// insider_note is this string has no real note yet and should be regenerated
// (e.g. after the prompt was strengthened), not treated as finished intel.
export const NO_INSIDER_NOTE = "Congratulations, you've discovered a wine that even deep AI can't. Humans win, Cheers!";

// True when a wine has a genuine inside line (not blank, not the placeholder).
export function hasRealInsiderNote(note: string | null | undefined): boolean {
  const t = (note ?? '').trim();
  return !!t && t !== NO_INSIDER_NOTE;
}
