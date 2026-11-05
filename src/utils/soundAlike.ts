// Sound-alike matching against the user's OWN wines. Speech-to-text often hears
// wine names as ordinary words ("chateau rear sack" for Château Rieussec,
// "tallow bow" for Tollot-Beaut). Spelling-based matching misses these, so each
// name gets a rough "sounds like" key — mostly its consonant skeleton, with
// French/Italian/German spellings folded to how they're said — and spoken words
// are compared key to key. Runs on the phone against the cellar it already has.

import type { CellarWine } from '../types/wine';

// Words that carry no identity (and generic estate words) — dropped before keys
// are built, so "Château X" and "Domaine X" key on X.
const FILLER = new Set([
  'chateau', 'domaine', 'dom', 'clos', 'maison', 'cave', 'caves', 'tenuta', 'bodega', 'bodegas', 'weingut',
  'estate', 'estates', 'winery', 'vineyard', 'vineyards', 'cellars', 'family', 'the', 'de', 'du', 'des',
  'la', 'le', 'les', 'di', 'del', 'della', 'von', 'van', 'and', 'et', 'of', 'a', 'an',
  'bottle', 'bottles', 'wine', 'wines', 'red', 'white', 'one', 'two', 'three', 'four', 'five', 'six',
  'seven', 'eight', 'nine', 'ten', 'twelve', 'move', 'archive', 'delete', 'add', 'find', 'from', 'to', 'in',
  'my', 'this', 'that', 'rack', 'fridge', 'bin', 'case', 'please', 'where', 'did', 'i', 'drink', 'have',
]);

function fold(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Rough phonetic key for ONE word.
export function soundKey(word: string): string {
  let w = fold(word).replace(/[^a-z]/g, '');
  if (!w) return '';
  w = w
    .replace(/eaux?$/, 'o').replace(/eau/g, 'o').replace(/aux?$/, 'o')
    .replace(/ph/g, 'f').replace(/gh/g, 'g').replace(/th/g, 't')
    .replace(/sch/g, 'sh').replace(/ch/g, 'sh').replace(/sh/g, 'S')
    .replace(/qu/g, 'k').replace(/ck/g, 'k').replace(/cc(?=[ei])/g, 'ks')
    .replace(/c(?=[eiy])/g, 's').replace(/c/g, 'k').replace(/q/g, 'k').replace(/x/g, 'ks')
    .replace(/gn/g, 'ny').replace(/gli/g, 'ly').replace(/ll/g, 'l')
    .replace(/z/g, 's').replace(/w/g, 'v').replace(/y/g, 'i')
    .replace(/([aeiou])h/g, '$1').replace(/^h/, '')
    // Silent French endings (Margaux, Bordeaux handled above; -et, -ot, -ts, -t, -d).
    // A final -s is kept: Rayas, Rieussec-style names say it.
    .replace(/([aeiou])(ts|t|d|x)$/, '$1');
  // Consonant skeleton (vowels mostly don't survive speech-to-text), duplicates collapsed.
  const first = w[0];
  const body = w.replace(/[aeiou]/g, '');
  const skel = (/[aeiou]/.test(first) ? 'A' : '') + body;
  return skel.replace(/(.)\1+/g, '$1');
}

function keyOfWords(words: string[]): string {
  return words.map(soundKey).join('');
}

function words(s: string | null | undefined): string[] {
  return fold(s ?? '').split(/[^a-z0-9]+/).filter((t) => t && !FILLER.has(t) && !/^\d+$/.test(t));
}

function lev(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
function sim(a: string, b: string): number {
  const max = Math.max(a.length, b.length);
  return max ? 1 - lev(a, b) / max : 0;
}

// Best match of a name (as word list) anywhere in the spoken words: compare the
// name's key with every 1–4 word window of what was said.
function bestWindowScore(nameWords: string[], spoken: string[]): number {
  const target = keyOfWords(nameWords);
  if (target.length < 2) return 0;
  let best = 0;
  for (let i = 0; i < spoken.length; i++) {
    for (let len = 1; len <= 4 && i + len <= spoken.length; len++) {
      const k = keyOfWords(spoken.slice(i, i + len));
      if (!k) continue;
      if (Math.abs(k.length - target.length) > 3) continue;
      const s = sim(k, target);
      if (s > best) best = s;
    }
  }
  return best;
}

export type SoundMatch = { wine: CellarWine; score: number };

// Rank wines by how closely what was said SOUNDS like them. Producer and cuvée
// are scored separately (people say either) and a spoken vintage that matches
// gives a small boost. Returns the best `max` with a usable score.
export function rankWinesBySound(spokenText: string, wines: CellarWine[], max = 6, minScore = 0.67): SoundMatch[] {
  const spoken = words(spokenText);
  if (!spoken.length || !wines.length) return [];
  const year = spokenText.match(/\b(19|20)\d{2}\b/)?.[0] ?? null;
  const out: SoundMatch[] = [];
  for (const w of wines) {
    const p = words(w.producer);
    const n = words(w.wine_name);
    let score = Math.max(
      p.length ? bestWindowScore(p, spoken) : 0,
      n.length ? bestWindowScore(n, spoken) : 0,
      p.length && n.length ? bestWindowScore([...p, ...n], spoken) : 0,
    );
    if (score < minScore) continue;
    if (year && String(w.vintage ?? '').trim() === year) score += 0.05;
    out.push({ wine: w, score });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, max);
}

// Rewrite misheard wine names in a sentence to the real name from the user's
// cellar, when the match is strong ("where did I drink chateau rear sack" →
// "where did I drink Château Rieussec"). Conservative: multi-consonant keys only.
export type SoundNameIndex = { name: string; key: string; folded: string }[];

// Pre-build the sound keys for a list of names once (a big cellar has thousands).
export function buildSoundNameIndex(names: string[]): SoundNameIndex {
  return Array.from(new Set(names.map((n) => (n ?? '').trim()).filter(Boolean)))
    .map((name) => ({ name, key: keyOfWords(words(name)), folded: fold(name) }))
    .filter((e) => e.key.length >= 3);
}

export function correctWineNamesBySound(text: string, names: string[] | SoundNameIndex): string {
  const tokens = [...text.matchAll(/\S+/g)].map((m) => ({ raw: m[0], start: m.index ?? 0, end: (m.index ?? 0) + m[0].length }));
  if (!tokens.length || !names.length) return text;
  const entries: SoundNameIndex = typeof names[0] === 'string' ? buildSoundNameIndex(names as string[]) : (names as SoundNameIndex);
  const used = new Array(tokens.length).fill(false);
  const reps: { start: number; end: number; text: string }[] = [];
  for (let i = 0; i < tokens.length; i++) {
    let best: { len: number; name: string; s: number } | null = null;
    for (let len = 4; len >= 1; len--) {
      if (i + len > tokens.length || used.slice(i, i + len).some(Boolean)) continue;
      const span = tokens.slice(i, i + len).map((t) => t.raw);
      const plain = span.map((t) => fold(t).replace(/[^a-z]/g, ''));
      const kept = plain.filter((t) => t && !FILLER.has(t));
      if (!kept.length || !kept.some((t) => t.length >= 3)) continue;
      const k = keyOfWords(kept);
      if (k.length < 3) continue;
      for (const e of entries) {
        // Never swallow ordinary words around the name: every word in the span
        // must be a sound word or a word of the name itself ("chateau").
        if (plain.some((t) => t && FILLER.has(t) && !e.folded.split(/[^a-z]+/).includes(t))) continue;
        if (Math.abs(k.length - e.key.length) > 1) continue;
        const s = sim(k, e.key);
        if (s >= 0.8 && (!best || s > best.s)) best = { len, name: e.name, s };
      }
    }
    if (best) {
      const spanText = fold(tokens.slice(i, i + best.len).map((t) => t.raw).join(' '));
      if (!fold(best.name).includes(spanText)) {
        for (let k = i; k < i + best.len; k++) used[k] = true;
        reps.push({ start: tokens[i].start, end: tokens[i + best.len - 1].end, text: best.name });
      }
    }
  }
  let out = text;
  for (const r of reps.sort((a, b) => b.start - a.start)) out = out.slice(0, r.start) + r.text + out.slice(r.end);
  return out;
}
