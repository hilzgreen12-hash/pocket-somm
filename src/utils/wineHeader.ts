// Shared formatter for the wine card header line used throughout the app.
// Pattern: Producer · Wine Name · Vintage — deduped to "Producer · Vintage"
// when the wine name and producer are the same string (case/whitespace
// insensitive). Region is displayed separately below this line.

export function wineHeaderLine(
  producer: string | null | undefined,
  wineName: string | null | undefined,
  vintage: string | number | null | undefined,
): string {
  const sameName = (wineName ?? '').trim().toLowerCase() === (producer ?? '').trim().toLowerCase();
  const v = vintage != null ? String(vintage) : null;
  const parts = sameName ? [producer, v] : [producer, wineName, v];
  return parts.filter((p) => p && String(p).trim().length > 0).join(' · ');
}
