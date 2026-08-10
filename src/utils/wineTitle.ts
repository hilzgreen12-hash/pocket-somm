// Canonical one-line wine title: Producer · Wine Name · Region · Vintage.
//
// Used wherever a wine is shown as a single-line title — predictive search
// options, disambiguation lists, confirmation read-backs — so every list reads
// the same way and is easy to scan. Only non-empty parts appear, joined by " · ",
// in this fixed order. Vintage is included whenever there is one (incl. "NV").
export function formatWineTitle(parts: {
  producer?: string | null;
  wineName?: string | null;
  region?: string | null;
  vintage?: string | number | null;
}): string {
  const vint = parts.vintage != null && String(parts.vintage).trim() ? String(parts.vintage).trim() : null;
  return [parts.producer, parts.wineName, parts.region, vint]
    .map((s) => (s == null ? '' : String(s).trim()))
    .filter((s) => s.length > 0)
    .join(' · ');
}
