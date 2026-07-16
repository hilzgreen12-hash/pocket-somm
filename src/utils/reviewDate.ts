// Review/visit dates are stored as ISO timestamps but edited as YYYY-MM-DD
// text (matching the ChosenWineModal review-date field — no date-picker dep).

export function isoToYmd(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// Parse a YYYY-MM-DD string back to an ISO timestamp. Returns null when the
// text isn't a complete, valid date (so callers can skip writing it). Anchored
// at local noon so the stored date can't shift a day across time zones.
export function ymdToIso(ymd: string): string | null {
  const t = ymd.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  const d = new Date(`${t}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
