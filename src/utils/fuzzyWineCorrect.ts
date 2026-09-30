// Data-driven dictation correction: snap misheard words in a dictated note to the
// closest REAL producer name from the user's own cellar. This covers the long tail
// of producers that a hand-written phonetic dictionary (wineDictation.ts) can't —
// it scales automatically with the catalogue and is personalised (the user's own
// wines win). Deliberately CONSERVATIVE: it only replaces a distinctive,
// multi-syllable token window when there's a strong, unambiguous match, so ordinary
// prose is never mangled. Run on FINAL transcripts only (it's O(tokens × producers)).

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    const cur = new Array<number>(n + 1);
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = cur;
  }
  return prev[n];
}

function similarity(a: string, b: string): number {
  const max = Math.max(a.length, b.length);
  return max === 0 ? 1 : 1 - levenshtein(a, b) / max;
}

// Accent-stripped, letters-only key for phonetic-ish comparison.
function normKey(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');
}

// Words that must never be swallowed by a single-word producer match.
const STOP = new Set([
  'the', 'and', 'with', 'wine', 'wines', 'red', 'white', 'rose', 'estate', 'domaine',
  'chateau', 'vineyard', 'vineyards', 'winery', 'cellars', 'cellar', 'family', 'reserve',
  'grand', 'premier', 'vintage', 'bottle', 'glass', 'lovely', 'great', 'really', 'bought',
]);

export interface ProducerIndex {
  entries: { canonical: string; key: string; words: number }[];
}

// Build a de-duped, filtered producer index from cellar producer names.
export function buildProducerIndex(producers: (string | null | undefined)[]): ProducerIndex {
  const seen = new Set<string>();
  const entries: ProducerIndex['entries'] = [];
  for (const p of producers) {
    const canonical = (p ?? '').trim();
    if (!canonical) continue;
    const key = normKey(canonical);
    if (key.length < 5) continue; // too short → over-match risk, skip
    if (seen.has(key)) continue;
    seen.add(key);
    entries.push({ canonical, key, words: Math.min(3, canonical.split(/\s+/).length) });
  }
  // Longer / multi-word candidates first — they're more specific, so they win over
  // a looser single-word match on the same span.
  entries.sort((a, b) => b.words - a.words || b.key.length - a.key.length);
  return { entries };
}

// Correct producer names in `text` against the index. Returns the text unchanged
// when nothing matches confidently.
export function fuzzyCorrectProducers(text: string, index: ProducerIndex): string {
  if (!index.entries.length || !text.trim()) return text;
  const tokens = [...text.matchAll(/\S+/g)].map((m) => ({ raw: m[0], start: m.index ?? 0, end: (m.index ?? 0) + m[0].length }));
  if (!tokens.length) return text;

  const used = new Array<boolean>(tokens.length).fill(false);
  const replacements: { start: number; end: number; text: string }[] = [];

  for (let wi = 0; wi < tokens.length; wi++) {
    if (used[wi]) continue;
    for (const e of index.entries) {
      const w = e.words;
      if (wi + w > tokens.length) continue;
      let overlap = false;
      for (let k = wi; k < wi + w; k++) if (used[k]) { overlap = true; break; }
      if (overlap) continue;

      const windowKey = normKey(tokens.slice(wi, wi + w).map((t) => t.raw).join(''));
      if (!windowKey) continue;
      if (windowKey[0] !== e.key[0]) continue;                 // cheap prune
      if (Math.abs(windowKey.length - e.key.length) > 2) continue;

      // A single-word match must be distinctive: long enough, not a common word.
      if (w === 1 && (e.key.length < 6 || STOP.has(windowKey))) continue;

      const threshold = w >= 2 ? 0.82 : 0.86;
      if (similarity(windowKey, e.key) >= threshold) {
        for (let k = wi; k < wi + w; k++) used[k] = true;
        replacements.push({ start: tokens[wi].start, end: tokens[wi + w - 1].end, text: e.canonical });
        break;
      }
    }
  }

  if (!replacements.length) return text;
  // Apply right-to-left so earlier indices stay valid.
  replacements.sort((a, b) => b.start - a.start);
  let out = text;
  for (const r of replacements) out = out.slice(0, r.start) + r.text + out.slice(r.end);
  return out;
}
