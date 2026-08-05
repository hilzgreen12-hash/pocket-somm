// Standalone wine-identity matching key — kept dependency-free so it can be
// shared by wineConnections, reviewDedup and the chosen-wines API without
// creating an import cycle (reviewDedup ↔ cellarReview ↔ wineConnections).

// Normalize for identity matching, tolerant of the formatting differences that
// crop up between a label scan and a list scan of the SAME wine: strip
// diacritics ("Château" == "Chateau"), drop any 4-digit vintage embedded in the
// name (we match vintage-agnostically anyway, so "Barolo Ravera 2019" ==
// "Barolo Ravera"), fold punctuation to spaces, collapse and trim.
const norm = (s: string | null | undefined) => (s ?? '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/\b(?:19|20)\d{2}\b/g, ' ')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

// Definite articles that appear (or not) on a producer name without changing the
// wine — "Il Marroneto" == "Marroneto", "Le Pin" == "Pin". Dropped from the key.
// Prepositions that carry meaning inside an appellation (di, de, del, du…) are
// deliberately NOT here — "Brunello di Montalcino" keeps its "di".
const ARTICLES = new Set(['il', 'lo', 'la', 'le', 'les', 'gli', 'the', 'el', 'los', 'las', 'der', 'die', 'das']);

// Fold accents + lowercase for accent-insensitive text search ("Müller" ==
// "Muller"). Keeps everything else (punctuation, digits) so it's safe for
// free-text "does this contain that" matching, unlike the stricter key below.
export function foldAccents(s: string | null | undefined): string {
  return (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// Order- and field-placement-independent identity key. A label scan and a list
// scan of the same wine often split producer vs name differently (or repeat the
// producer inside the name), so we match on the SET of significant words across
// BOTH fields: same words in any order/placement → same wine; different words →
// different wine (kept conservative so distinct cuvées don't merge). Definite
// articles are dropped so "Il Marroneto" and "Marroneto" match.
export function wineNameKey(producer: string | null | undefined, wineName: string | null | undefined): string {
  const tokens = norm(`${producer ?? ''} ${wineName ?? ''}`).split(' ').filter((t) => t && !ARTICLES.has(t));
  return Array.from(new Set(tokens)).sort().join(' ');
}
