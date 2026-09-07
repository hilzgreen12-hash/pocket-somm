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

// Canonical search string for the Wine-Searcher API and any external lookup —
// the SAME producer/name identity the header displays, collapsed to one query
// string. Producer + wine name, but never repeating the producer when the name
// already leads with it (or equals it), so "Penfolds" + "Penfolds Grange" →
// "Penfolds Grange", not "Penfolds Penfolds Grange". Keeps display, lookup and
// stored record documenting the wine the same way.
export function wineQueryName(
  producer: string | null | undefined,
  wineName: string | null | undefined,
): string {
  const p = (producer ?? '').trim();
  const n = (wineName ?? '').trim();
  if (!p) return n;
  if (!n) return p;
  const pl = p.toLowerCase();
  const nl = n.toLowerCase();
  if (nl === pl || nl.startsWith(pl + ' ')) return n;
  return `${p} ${n}`;
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

// Significant-word token set across the supplied fields (producer, wine name,
// grape…). 3+ chars so short connectors don't count; articles dropped.
function identityTokens(...parts: (string | number | null | undefined)[]): Set<string> {
  const joined = parts.filter((p) => p != null && p !== '').map(String).join(' ');
  return new Set(norm(joined).split(' ').filter((t) => t.length >= 3 && !ARTICLES.has(t)));
}

// LOOSER identity match, used only as a FALLBACK after wineNameKey exact fails.
// The same wine scanned twice often splits producer/name/grape differently — one
// row folds the grape into the name ("Iron Syrah Kasteelsig"), another keeps it
// as a separate field ("Iron Kasteelsig" + grape Syrah). We treat them as the
// same wine when the (normalised) vintage matches AND one side's significant
// words are a SUBSET of the other's, tokenising producer + name + grape. The
// smaller set must have ≥2 tokens so a lone shared grape word can't false-match.
export function looseWineMatch(
  a: { producer?: string | null; wineName?: string | null; grape?: string | null; vintage?: string | number | null },
  b: { producer?: string | null; wineName?: string | null; grape?: string | null; vintage?: string | number | null },
): boolean {
  const av = String(a.vintage ?? '').trim().toLowerCase();
  const bv = String(b.vintage ?? '').trim().toLowerCase();
  if (!av || av !== bv) return false;
  const at = identityTokens(a.producer, a.wineName, a.grape);
  const bt = identityTokens(b.producer, b.wineName, b.grape);
  if (at.size < 2 || bt.size < 2) return false;
  const [small, big] = at.size <= bt.size ? [at, bt] : [bt, at];
  for (const t of small) if (!big.has(t)) return false;
  return true;
}
