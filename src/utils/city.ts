// Canonical city name helper.
//
// Different sources hand us slightly different shapes for the same
// place: Apple/Google reverseGeocodeAsync on a UK device commonly
// returns "Greater London" for the subregion when geo.city is a
// borough (Camden / Westminster / etc.); users typing free-form
// might write "Greater London" as well. We want a single canonical
// "London" across the app so review lists, sort-by-city, and the
// city autocomplete don't fragment the same place into two entries.
//
// Apply this at both save and display sites — that way new writes
// land canonical AND legacy rows render canonical without needing
// a backfill migration.

const ALIASES: Record<string, string> = {
  'greater london': 'London',
  // Add further canonical mappings here as they crop up. Keep keys
  // lower-cased; the lookup normalises before matching.
};

export function normaliseCity(input: string | null | undefined): string {
  const raw = (input ?? '').trim();
  if (!raw) return '';
  const key = raw.toLowerCase();
  return ALIASES[key] ?? raw;
}
