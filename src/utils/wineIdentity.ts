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

// Generic winery-TYPE words that may or may not prefix a producer without
// changing which wine it is — "Château Pontet-Canet" == "Pontet-Canet",
// "Kellerei/Cantina Terlan" == "Terlan", "Weingut Keller" == "Keller". Dropped
// from the identity key so the same wine filed with or without them matches.
// Kept deliberately conservative: identity-BEARING words (Clos, Mas, Castello,
// Quinta, Finca, Hospices…) are NOT here, so distinct estates don't over-merge.
const PRODUCER_WORDS = new Set([
  'chateau', 'domaine', 'domaines', 'weingut', 'weinhaus', 'kellerei', 'cantina', 'cantine',
  'bodega', 'bodegas', 'tenuta', 'tenute', 'azienda', 'maison', 'estate', 'winery', 'weinbau',
  'vineyard', 'vineyards', 'wines', 'wine', 'family', 'champagne',
]);

// Words dropped from the identity key — articles + winery-type words.
const KEY_STOPWORDS = new Set([...ARTICLES, ...PRODUCER_WORDS]);

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
  region?: string | null,
): string {
  const p = (producer ?? '').trim();
  const n = lookupWineName(producer, wineName, region);
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
  const tokens = norm(`${producer ?? ''} ${wineName ?? ''}`).split(' ').filter((t) => t && !KEY_STOPWORDS.has(t));
  return Array.from(new Set(tokens)).sort().join(' ');
}

// Significant-word token set across the supplied fields (producer, wine name,
// grape…). 3+ chars so short connectors don't count; articles dropped.
function identityTokens(...parts: (string | number | null | undefined)[]): Set<string> {
  const joined = parts.filter((p) => p != null && p !== '').map(String).join(' ');
  return new Set(norm(joined).split(' ').filter((t) => t.length >= 3 && !KEY_STOPWORDS.has(t)));
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
  // Short cuvée codes count too: "Roses de Jeanne HL/R21" vs "BO/R21" share
  // every 3+ letter word but are different wines — the smaller side's short
  // tokens must also appear on the bigger side.
  const shortOf = (w: typeof a) => new Set(norm([w.producer, w.wineName, w.grape].filter(Boolean).join(' ')).split(' ').filter((t) => t && t.length < 3 && !/^\d+$/.test(t) && !KEY_STOPWORDS.has(t) && !SHORT_CONNECTORS.has(t)));
  const [sa, sb] = [shortOf(a), shortOf(b)];
  const [ss, sbg] = small === at ? [sa, sb] : [sb, sa];
  for (const t of ss) if (!sbg.has(t)) return false;
  return true;
}

// Two-letter connectors that may appear in one rendering of a name and not the
// other ("Brunello di Montalcino" vs "Brunello Montalcino") — never identity.
const SHORT_CONNECTORS = new Set(['di', 'de', 'du', 'da', 'do', 'la', 'le', 'el', 'en', 'et', 'y', 'e', 'a', 'of', 'am', 'im', 'an', 'zu', 'st', 'ch']);

// The wine name to LOOK UP with. When the stored name is blank or just repeats
// the producer ("Il Marroneto" / "Il Marroneto"), the wine is the producer's
// appellation wine, so borrow the appellation from the region — only when the
// region is "Appellation, Region, Country" (3+ parts), so a broad "Tuscany,
// Italy" never gets bolted on. "Il Marroneto" + "Brunello di Montalcino,
// Tuscany, Italy" → "Brunello di Montalcino" (Wine-Searcher and the model both
// miss the bare producer name).
export function lookupWineName(
  producer: string | null | undefined,
  wineName: string | null | undefined,
  region?: string | null,
): string {
  const n = (wineName ?? '').trim();
  const repeatsProducer = !n || norm(n) === norm(producer);
  if (!repeatsProducer || !region) return n;
  const parts = region.split(',').map((x) => x.trim()).filter(Boolean);
  if (parts.length < 3) return n;
  const appellation = parts[0];
  if (norm(producer).includes(norm(appellation))) return n;
  return appellation;
}
