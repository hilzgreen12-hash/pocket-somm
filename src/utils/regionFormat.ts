// Consistent region presentation for France's two flagship regions.
//
// Users asked that Bordeaux and Burgundy wines always read the same way and
// NEVER carry a trailing ", France" (which only some rows had). We also collapse
// duplicated appellation segments (e.g. "St Emilion Grand Cru, Saint Emilion
// Grand Cru" — the same thing written two ways) and normalise "Bourgogne" to the
// English "Burgundy" so the anchor word is uniform.
//
// Target shape (region field only; the producer/Château is shown separately):
//   Bordeaux → "<Appellation [+ Cru]>, Bordeaux"      e.g. "Pauillac 3ème Cru, Bordeaux"
//   Burgundy → "<Appellation[, sub][, Cru]>, Burgundy" e.g. "Chablis, Montée de Tonnerre 1er Cru, Burgundy"
//
// This is a DISPLAY tidy (and is applied when recording new wines); a separate
// one-off pass re-normalises already-stored rows.

const BORDEAUX_RE = /\bbordeaux\b/i;
const BURGUNDY_RE = /\b(burgundy|bourgogne)\b/i;

// Dedupe key for an appellation segment: accent-fold, lowercase, and fold the
// "St"/"Ste" abbreviations to "saint"/"sainte" so "St Emilion" == "Saint Émilion".
function segKey(s: string): string {
  return s
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\bst\b/g, 'saint')
    .replace(/\bste\b/g, 'sainte')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function tidyWineRegion(region: string | null | undefined): string | null {
  const raw = (region ?? '').trim();
  if (!raw) return region ?? null;
  const isBordeaux = BORDEAUX_RE.test(raw);
  const isBurgundy = BURGUNDY_RE.test(raw);
  if (!isBordeaux && !isBurgundy) return raw; // other regions untouched

  const anchor = isBordeaux ? 'Bordeaux' : 'Burgundy';
  const seen = new Set<string>();
  const parts: string[] = [];
  for (let seg of raw.split(',')) {
    seg = seg.trim();
    if (!seg) continue;
    if (/^france$/i.test(seg)) continue;              // never record France for these
    if (/^(bordeaux|burgundy|bourgogne)$/i.test(seg)) continue; // anchor re-appended at the end
    const k = segKey(seg);
    if (!k || seen.has(k)) continue;                  // drop duplicate appellation segments
    seen.add(k);
    parts.push(seg);
  }
  parts.push(anchor);
  return parts.join(', ');
}
