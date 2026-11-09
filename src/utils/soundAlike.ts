// Sound-alike matching against the user's OWN wines. Speech-to-text often hears
// wine names as ordinary words ("chateau rear sack" for Château Rieussec,
// "tallow bow" for Tollot-Beaut). Spelling-based matching misses these, so each
// name gets a rough "sounds like" key — mostly its consonant skeleton, with
// French/Italian/German spellings folded to how they're said — and spoken words
// are compared key to key. Runs on the phone against the cellar it already has.

import type { CellarWine } from '../types/wine';
import { BURGUNDY_NAMES } from '../constants/burgundyNames';
import { EUROPEAN_WINE_NAMES } from '../constants/europeanWineNames';

// Words that carry no identity (and generic estate words) — dropped before keys
// are built, so "Château X" and "Domaine X" key on X. ("Clos" stays: in
// Burgundy it IS the name — Clos de Tart, Clos Saint-Jacques.)
const FILLER = new Set([
  'chateau', 'domaine', 'dom', 'maison', 'cave', 'caves', 'tenuta', 'bodega', 'bodegas', 'weingut',
  'estate', 'estates', 'winery', 'vineyard', 'vineyards', 'cellars', 'family', 'the', 'de', 'du', 'des',
  'la', 'le', 'les', 'aux', 'au', 'en', 'di', 'del', 'della', 'von', 'van', 'and', 'et', 'of', 'a', 'an',
  'bottle', 'bottles', 'wine', 'wines', 'red', 'white', 'one', 'two', 'three', 'four', 'five', 'six',
  'seven', 'eight', 'nine', 'ten', 'twelve', 'move', 'archive', 'delete', 'add', 'find', 'from', 'to', 'in',
  'my', 'this', 'that', 'rack', 'fridge', 'bin', 'case', 'please', 'where', 'did', 'i', 'drink', 'have',
]);

// Short words speech-to-text makes out of a syllable of a French name.
const SYLLABLE = new Set(['a', 'an', 'en', 'au', 'in', 'la', 'le', 'de', 'du', 'des', 'les', 'aux']);
// …and the ones that can END a misheard name ("roo jee AN" = Rugiens).
const END_SYLLABLE = new Set(['an', 'en', 'in']);

// Everyday English words a general wine-name list (e.g. Burgundy climats) must
// never replace on their own ("mountain" ≠ Montagny, "friends" ≠ Les Frionnes).
// Food / cooking words: never turned into a wine name, even one the user owns
// ("chicken" → "Les Chenevottes", "mashed potato" → "M Chapoutier"), unless
// the word is genuinely part of that wine's name.
const FOOD = new Set([
  'chicken', 'chickens', 'roast', 'roasted', 'roasting', 'mash', 'mashed', 'potato', 'potatoes', 'chips', 'fries',
  'beef', 'steak', 'steaks', 'lamb', 'pork', 'veal', 'venison', 'duck', 'goose', 'turkey', 'pheasant', 'partridge',
  'grouse', 'rabbit', 'ham', 'bacon', 'sausage', 'sausages', 'fish', 'salmon', 'cod', 'haddock', 'sole', 'turbot',
  'halibut', 'tuna', 'trout', 'bass', 'prawns', 'prawn', 'shrimp', 'lobster', 'crab', 'oysters', 'oyster', 'mussels',
  'scallops', 'squid', 'octopus', 'sushi', 'cheese', 'pasta', 'risotto', 'pizza', 'salad', 'soup', 'stew', 'curry',
  'pie', 'tart', 'cake', 'dessert', 'pudding', 'chocolate', 'sauce', 'gravy', 'butter', 'cream', 'creamy', 'garlic',
  'onion', 'onions', 'mushroom', 'mushrooms', 'morel', 'morels', 'truffle', 'truffles', 'asparagus', 'peas', 'beans',
  'carrots', 'cabbage', 'spinach', 'kale', 'leeks', 'leek', 'tomato', 'tomatoes', 'lemon', 'herbs', 'rosemary',
  'thyme', 'sage', 'mint', 'pepper', 'peppers', 'chilli', 'chili', 'spicy', 'grilled', 'baked', 'fried', 'braised',
  'smoked', 'slow', 'cooked', 'rice', 'bread', 'noodles', 'vegetables', 'veg', 'greens', 'gratin', 'dauphinoise',
]);

const COMMON = new Set([
  'mountain', 'mountains', 'friend', 'friends', 'cotton', 'button', 'mutton', 'morning', 'evening', 'night', 'dinner',
  'lunch', 'breakfast', 'money', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'mother', 'father', 'brother', 'sister', 'husband', 'wife', 'garden', 'kitchen', 'chicken', 'birthday', 'party',
  'lovely', 'really', 'very', 'pretty', 'great', 'nice', 'good', 'better', 'best', 'bought', 'brought', 'drank',
  'drunk', 'opened', 'open', 'glass', 'glasses', 'table', 'restaurant', 'bar', 'dinner', 'holiday', 'trip',
  'tonight', 'today', 'yesterday', 'tomorrow', 'week', 'month', 'year', 'recently', 'last', 'first', 'next',
  'cellar', 'storage', 'location', 'shelf', 'bottom', 'top', 'left', 'right', 'small', 'large', 'big', 'little',
  'score', 'review', 'rating', 'price', 'value', 'cost', 'cheap', 'expensive', 'meal', 'food', 'steak', 'beef',
  'lamb', 'pork', 'fish', 'cheese', 'pasta', 'pizza', 'salad', 'dessert', 'chocolate', 'cake', 'sauce',
  'many', 'much', 'more', 'most', 'some', 'any', 'all', 'none', 'which', 'what', 'when', 'who', 'how', 'why',
  'think', 'thought', 'liked', 'loved', 'enjoyed', 'tasted', 'tasting', 'notes', 'note', 'merry',
  'money', 'honey', 'sunny', 'sorry', 'carry', 'marry', 'berry', 'cherry', 'jolly', 'hurry', 'worry',
  'cool', 'warm', 'cold', 'hot',
  'month', 'months', 'family', 'people', 'guests', 'colleague', 'boss', 'client', 'anniversary', 'christmas',
  'roast', 'roasted', 'toast', 'grilled', 'baked', 'fried', 'braised', 'stew', 'soup', 'bread', 'butter', 'cream',
  'rice', 'risotto', 'duck', 'turkey', 'goose', 'veal', 'venison', 'game', 'oysters', 'lobster', 'crab', 'salmon',
  'come', 'came', 'went', 'said', 'told', 'asked', 'gave', 'given', 'kept', 'left', 'put', 'set',
  'other', 'another', 'again', 'still', 'just', 'only', 'also', 'even', 'ever', 'never', 'always', 'often',
]);

function fold(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Spell ONE word the way it's said (French/Italian/German folded to English
// sounds). `dropFinal` also drops French silent endings (Clos, Nuits, Pommard,
// Bonnes, Échezeaux) — keys are compared both ways, since some names say them
// (Rayas) and most don't.
function prep(word: string, dropFinal: boolean): string {
  let w = fold(word).replace(/[^a-z]/g, '');
  if (!w) return '';
  w = w
    .replace(/eaux?$/, 'o').replace(/eau/g, 'o').replace(/aux?$/, 'o').replace(/ault?$/, 'o')
    .replace(/ph/g, 'f').replace(/gh/g, '').replace(/th/g, 't')
    .replace(/sch/g, 'sh').replace(/ch/g, 'sh').replace(/sh/g, 'S')
    .replace(/qu/g, 'k').replace(/ck/g, 'k').replace(/cc(?=[ei])/g, 'ks')
    .replace(/c(?=[eiy])/g, 's').replace(/c/g, 'k').replace(/q/g, 'k').replace(/x(?=.)/g, 'ks')
    .replace(/g(?=[eiy])/g, 'j')
    .replace(/gn/g, 'ny').replace(/gli/g, 'ly').replace(/([aeiou])ill/g, '$1i').replace(/ll/g, 'l')
    .replace(/^S(?=[pt])/, 's')
    .replace(/tz|ts/g, 's').replace(/z/g, 's')
    // W: a glide after a consonant (pwee, nwee, fwee), a V at the start (German Würzgarten).
    .replace(/^w/, 'v').replace(/w/g, '').replace(/y/g, 'i')
    .replace(/([aeiou])h/g, '$1').replace(/^h/, '');
  if (dropFinal) w = w.replace(/([aeiourn])(ent|es|ts|t|d|x|s)$/, '$1');
  return w.replace(/x$/, '');
}

// Consonant skeleton of the joined spelling (vowels rarely survive speech-to-
// text intact); one leading-vowel marker; doubled sounds collapsed.
function skeleton(w: string): string {
  if (!w) return '';
  const lead = /[aeiou]/.test(w[0]) ? 'A' : '';
  return (lead + w.replace(/[aeiou]/g, '')).replace(/(.)\1+/g, '$1');
}

function keyOfWords(ws: string[], dropFinal = false): string {
  return skeleton(ws.map((x) => prep(x, dropFinal)).join(''));
}

// Rough phonetic key for ONE word.
export function soundKey(word: string): string {
  return keyOfWords([word]);
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
  // Names compared with and without French silent endings (Tollot-Beaut says
  // "-bo"; Rayas says its s), against what was said, also both ways.
  const targets = [keyOfWords(nameWords), keyOfWords(nameWords, true)].filter((t) => t.length >= 2);
  if (!targets.length) return 0;
  let best = 0;
  for (let i = 0; i < spoken.length; i++) {
    for (let len = 1; len <= 4 && i + len <= spoken.length; len++) {
      const win = spoken.slice(i, i + len);
      for (const k of [keyOfWords(win), keyOfWords(win, true)]) {
        if (!k) continue;
        for (const target of targets) {
          if (Math.abs(k.length - target.length) > 3) continue;
          const s = sim(k, target);
          if (s > best) best = s;
        }
      }
    }
  }
  return best;
}

export type SoundMatch = { wine: CellarWine; score: number };

function runTogether(nameWords: string[], spoken: string[]): boolean {
  const keys = nameWords.map(soundKey).filter((k) => k.length >= 3);
  if (!keys.length) return false;
  const spokenKeys = spoken.map(soundKey).filter((k) => k.length >= 4);
  return keys.some((k) => spokenKeys.some((sk) => sk !== k && (
    sk.startsWith(k) || sk.includes(k) || (k.length >= 4 && sk.includes(k.slice(0, -1)))
  )));
}

// The producer the user most likely meant, by sound — used when the exact
// wine can't be matched ("René Engel La Brulli" → René Engel), so Vinster can
// offer that producer's wines instead of saying it found nothing.
export function likelyProducerWines(spokenText: string, wines: CellarWine[]): { producer: string; wines: CellarWine[] } | null {
  const spoken = words(spokenText);
  if (!spoken.length) return null;
  const byProducer = new Map<string, { producer: string; wines: CellarWine[]; score: number }>();
  for (const w of wines) {
    const name = (w.producer ?? '').trim();
    const pw = words(name);
    if (!pw.length) continue;
    const key = pw.join(' ');
    let entry = byProducer.get(key);
    if (!entry) {
      let score = bestWindowScore(pw, spoken);
      if (score < 0.75 && runTogether(pw, spoken)) score = 0.75;
      // Any single distinctive producer word heard clearly ("engel").
      if (score < 0.75 && pw.some((t) => soundKey(t).length >= 3 && spoken.some((sp) => soundKey(sp) === soundKey(t)))) score = 0.75;
      // Longer producer names are more specific ("René Engel" over "Engel Family").
      if (score >= 0.75) score += Math.min(0.08, pw.join('').length * 0.005);
      entry = { producer: name, wines: [], score };
      byProducer.set(key, entry);
    }
    entry.wines.push(w);
  }
  const best = Array.from(byProducer.values()).filter((e) => e.score >= 0.75).sort((a, b) => b.score - a.score);
  if (!best.length) return null;
  // Ambiguous between two producers equally → let the normal flow handle it.
  if (best.length > 1 && best[1].score === best[0].score) return null;
  return { producer: best[0].producer, wines: best[0].wines };
}

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
    // Each part scored on its own, plus a small bonus for a longer (more
    // specific) name, so "René Engel" beats "Engel Family" on "rene engel".
    const part = (ws: string[]) => {
      if (!ws.length) return 0;
      let sc = bestWindowScore(ws, spoken);
      // Speech-to-text often runs words together ("Engel Les Brûlées" →
      // "engelabrule"): hearing a distinctive word inside a longer one counts.
      if (sc < 0.8 && runTogether(ws, spoken)) sc = 0.8;
      return sc ? sc + Math.min(0.08, ws.join('').length * 0.005) : 0;
    };
    const ps = part(p);
    // Cuvée: the whole name, or any one distinctive word of it ("Brûlées" in
    // "Vosne-Romanée Les Brûlées") — people say part of a long name.
    const ns = Math.max(part(n), ...n.filter((t) => soundKey(t).length >= 3).map((t) => part([t]) - 0.02));
    let score = Math.max(ps, ns, p.length && n.length ? part([...p, ...n]) : 0);
    // Heard the producer AND something of the cuvée → the more complete match wins.
    if (ps >= 0.8 && ns >= 0.6) score += 0.05;
    if (score < minScore) continue;
    if (year && String(w.vintage ?? '').trim() === year) score += 0.05;
    out.push({ wine: w, score });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, max);
}

// Rewrite misheard wine names in a sentence to the real name (the user's own
// wines, or a general list such as Burgundy appellations) when the match is
// strong ("where did I drink chateau rear sack" → "…Château Rieussec").
export type SoundNameEntry = {
  name: string; folded: string; words: number; isStatic: boolean;
  key: string; keyDrop: string; keyAll: string; keyAllDrop: string;
};
export type SoundNameIndex = SoundNameEntry[];

function allWords(s: string): string[] {
  return fold(s).split(/[^a-z0-9]+/).filter((t) => t && !/^\d+$/.test(t));
}

// Pre-build the sound keys for a list of names once (a big cellar has thousands).
// `isStatic` = a general list (not the user's wines) — matched more cautiously.
export function buildSoundNameIndex(names: string[], isStatic = false): SoundNameIndex {
  return Array.from(new Set(names.map((n) => (n ?? '').trim()).filter(Boolean)))
    .map((name) => {
      const ws = words(name);
      const all = allWords(name);
      return {
        name, folded: fold(name), words: ws.length, isStatic,
        key: keyOfWords(ws), keyDrop: keyOfWords(ws, true),
        keyAll: keyOfWords(all), keyAllDrop: keyOfWords(all, true),
      };
    })
    .filter((e) => Math.max(e.key.length, e.keyDrop.length, e.keyAll.length) >= 3);
}

export function correctWineNamesBySound(text: string, names: string[] | SoundNameIndex): string {
  const tokens = [...text.matchAll(/\S+/g)].map((m) => ({ raw: m[0], start: m.index ?? 0, end: (m.index ?? 0) + m[0].length }));
  if (!tokens.length || !names.length) return text;
  const entries: SoundNameIndex = typeof names[0] === 'string' ? buildSoundNameIndex(names as string[]) : (names as SoundNameIndex);
  const used = new Array(tokens.length).fill(false);
  const reps: { start: number; end: number; text: string }[] = [];
  for (let i = 0; i < tokens.length; i++) {
    let best: { len: number; name: string; s: number } | null = null;
    for (let len = 5; len >= 1; len--) {
      if (i + len > tokens.length || used.slice(i, i + len).some(Boolean)) continue;
      const span = tokens.slice(i, i + len).map((t) => t.raw);
      // Never swallow a number at either end ("reuse sec 2015" keeps its 2015).
      if (len > 1 && (/\d/.test(span[0]) || /\d/.test(span[span.length - 1]))) continue;
      // Hyphenated names count as their words ("Saint-Aubin" = two words).
      const plain = span.flatMap((t) => fold(t).split(/[^a-z]+/)).filter(Boolean)
        // "Les" is usually heard as "lay" / "lays".
        .map((t) => (t === 'lay' || t === 'lays' ? 'les' : t));
      const kept = plain.filter((t) => !FILLER.has(t));
      if (!kept.length) continue;
      const k = keyOfWords(kept);
      const kA = keyOfWords(plain);
      if (Math.max(k.length, kA.length) < 3) continue;
      const singleCommon = kept.length === 1 && COMMON.has(kept[0]);
      for (const e of entries) {
        const nameWords = e.folded.split(/[^a-z]+/);
        if (kept.some((t) => FOOD.has(t) && !nameWords.includes(t))) continue;
        // Never swallow ordinary words around the name: a filler word must belong
        // to the name itself ("les", "clos de") — except a tiny syllable word
        // INSIDE or at the END of a misheard name ("pull IN yee", "moulin A vaughn",
        // "roo jee AN"), never at the start ("a Corton" keeps its "a").
        if (plain.some((t, ti) => FILLER.has(t) && !nameWords.includes(t)
          && (ti === 0 || !SYLLABLE.has(t) || (ti === plain.length - 1 && !END_SYLLABLE.has(t))))) continue;
        if (e.isStatic) {
          // General lists: an everyday English word never becomes a wine name,
          // and a multi-word name needs at least two spoken words.
          if (singleCommon || kept.some((t) => COMMON.has(t))) continue;
          if (e.words >= 2 && kept.length < 2) continue;
        }
        // Compare spoken vs name keys with and without silent endings, both ways
        // ("bat" keeps its t; "Bâtard" drops its d).
        const scoreOf = (ws: string[], all: string[]) => {
          let best0 = 0;
          const cmp = (x: string, y: string) => {
            if (x.length >= 3 && Math.abs(x.length - y.length) <= 1) best0 = Math.max(best0, sim(x, y));
          };
          for (const x of [keyOfWords(ws), keyOfWords(ws, true)]) for (const y of [e.key, e.keyDrop]) cmp(x, y);
          for (const x of [keyOfWords(all), keyOfWords(all, true)]) for (const y of [e.keyAll, e.keyAllDrop]) cmp(x, y);
          return best0;
        };
        // Cheap length pre-check before any real comparison.
        const lens = [k.length, kA.length];
        const near = [e.key, e.keyDrop, e.keyAll, e.keyAllDrop].some((y) => lens.some((l) => Math.abs(l - y.length) <= 2));
        if (!near) continue;
        const sc = scoreOf(kept, plain);
        // Don't swallow a neighbouring word: if the name matches just as well
        // without the first or last spoken word, that word isn't part of it
        // ("rioha reserva" → only "reserva" is Reserva).
        if (plain.length > 1 && sc > 0) {
          const keptOf = (xs: string[]) => xs.filter((t) => !FILLER.has(t));
          // (An edge word that's part of the name — "Château", "Les" — is fine.)
          const edgeOk = (t: string) => FILLER.has(t) && nameWords.includes(t);
          const trimA = plain.slice(1), trimB = plain.slice(0, -1);
          if (!edgeOk(plain[0]) && scoreOf(keptOf(trimA), trimA) >= sc) continue;
          if (!edgeOk(plain[plain.length - 1]) && scoreOf(keptOf(trimB), trimB) >= sc) continue;
        }
        // Short keys must match exactly; longer ones may differ by one sound.
        const need = Math.min(k.length || 99, kA.length || 99) <= 3 ? 1 : 0.8;
        // A match that explains more of what was said wins ("lay com bet" → Les
        // Combettes, not La Comme + "bet"); then closer vowels break ties
        // ("tora si" → Taurasi, not Torres).
        const vowelsClose = sim(kept.join(''), e.folded.replace(/[^a-z]/g, ''));
        const eff = sc + 0.08 * (plain.length - 1) + 0.05 * vowelsClose;
        if (sc >= need && (!best || eff > best.s)) best = { len, name: e.name, s: eff };
      }
    }
    if (best) {
      const norm = (x: string) => fold(x).replace(/[^a-z]+/g, ' ').trim();
      const spanText = norm(tokens.slice(i, i + best.len).map((t) => t.raw).join(' '));
      if (!norm(best.name).includes(spanText)) {
        for (let k = i; k < i + best.len; k++) used[k] = true;
        reps.push({ start: tokens[i].start, end: tokens[i + best.len - 1].end, text: best.name });
      } else {
        for (let k = i; k < i + best.len; k++) used[k] = true; // already right — leave it
      }
    }
  }
  let out = text;
  for (const r of reps.sort((a, b) => b.start - a.start)) out = out.slice(0, r.start) + r.text + out.slice(r.end);
  return out;
}

// Burgundy + German, Spanish and Italian names, keyed once on first use.
let euroIndex: SoundNameIndex | null = null;
export function europeanSoundIndex(): SoundNameIndex {
  if (!euroIndex) euroIndex = buildSoundNameIndex([...BURGUNDY_NAMES, ...EUROPEAN_WINE_NAMES], true);
  return euroIndex;
}
