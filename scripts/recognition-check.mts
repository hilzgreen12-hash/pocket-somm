// Pre-build recognition check — run before every APK / store build:
//
//   npm run check:recognition
//
// Signs in as a test account and puts a fixed list of real wines through the
// same live steps the app uses to recognise a wine (Wine-Searcher with the
// app's own lookup names, Vinster's wine knowledge, the web check). Every
// "must recognise" wine has to be recognised by at least one step, and the
// made-up wine must NOT be — and must come back with no invented facts.
// Exit code 1 (build blocked) on any failure.
//
// The test account's login is read from scripts/recognition-check.env (not
// committed):
//   RECOGNITION_EMAIL=...
//   RECOGNITION_PASSWORD=...
//
// Add every wine a user reports as wrongly unrecognised to WINES below, so it
// can never regress.

import { readFileSync, existsSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { wineQueryName, wineQueryAltName } from '../src/utils/wineIdentity.ts';

type Expect = 'recognise' | 'made-up';
interface TestWine { producer: string; wineName: string | null; vintage: string; region: string; expect: Expect; why: string }

const WINES: TestWine[] = [
  // Reported 2026-11-26 (Toronto users and the owner).
  { producer: 'Famille Perrin', wineName: 'Les Sinards', vintage: '2019', region: 'Châteauneuf-du-Pape, Southern Rhône, France', expect: 'recognise', why: 'Toronto scan, 2026-11-26' },
  { producer: 'La Grange St. Martin', wineName: 'La Pointe du Vent', vintage: '2019', region: 'Châteauneuf-du-Pape, Southern Rhône, France', expect: 'recognise', why: "owner's scan, 2026-11-26" },
  { producer: 'Fonjoya', wineName: 'Delta Le Petit Chose', vintage: '2024', region: 'Languedoc, France', expect: 'recognise', why: 'Toronto scan, 2026-11-26 (LCBO 50738)' },
  // Wines used in Vinster's videos and everyday checks.
  { producer: 'François Mitjavile', wineName: 'Roc de Cambes', vintage: '2015', region: 'Côtes de Bourg, Bordeaux, France', expect: 'recognise', why: 'video wine' },
  { producer: 'Château Thivin', wineName: 'Côte de Brouilly Cuvée La Chapelle', vintage: '2016', region: 'Côte de Brouilly, Beaujolais, France', expect: 'recognise', why: 'video wine' },
  { producer: 'Château Smith Haut Lafitte', wineName: 'Château Smith Haut Lafitte', vintage: '2015', region: 'Pessac-Léognan, Bordeaux, France', expect: 'recognise', why: 'video wine' },
  { producer: 'Château Lafite Rothschild', wineName: 'Château Lafite Rothschild', vintage: '2020', region: 'Pauillac, Bordeaux, France', expect: 'recognise', why: 'video wine' },
  { producer: 'Penfolds', wineName: 'Grange', vintage: '2018', region: 'South Australia, Australia', expect: 'recognise', why: 'benchmark' },
  // A misheard voice name that must still find the real wine.
  { producer: 'Ebensady', wineName: 'Palladiums', vintage: '2020', region: '', expect: 'recognise', why: 'misheard "Sadie Family Wines Palladius"' },
  // Made up: must not be recognised, and must carry no invented facts.
  { producer: 'Château Vinsterelle', wineName: 'Cuvée des Nuages Imaginaires', vintage: '2018', region: 'Saint-Émilion, Bordeaux, France', expect: 'made-up', why: 'no-invention guard' },
];

// --- Setup -------------------------------------------------------------------

function readEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {};
  const raw = readFileSync(path);
  // The project .env is saved as UTF-16 (see memory: it breaks some tools).
  const text = raw[0] === 0xff && raw[1] === 0xfe ? raw.subarray(2).toString('utf16le') : raw.toString('utf8');
  const out: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

const env = { ...readEnvFile('.env'), ...readEnvFile('scripts/recognition-check.env'), ...process.env } as Record<string, string | undefined>;
const url = env.EXPO_PUBLIC_SUPABASE_URL;
const anon = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const email = env.RECOGNITION_EMAIL;
const password = env.RECOGNITION_PASSWORD;
if (!url || !anon) { console.error('Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY in .env'); process.exit(2); }
if (!email || !password) { console.error('Missing RECOGNITION_EMAIL / RECOGNITION_PASSWORD — put them in scripts/recognition-check.env'); process.exit(2); }

const supabase = createClient(url, anon, { auth: { persistSession: false } });

async function call(fn: string, body: unknown): Promise<any> {
  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) throw new Error(`${fn}: ${error.message}`);
  return data;
}

// --- The app's recognition steps -----------------------------------------------

interface Result { ws: boolean; wsDown: boolean; identified: boolean; web: boolean; invented: string[] }

async function check(w: TestWine): Promise<Result> {
  const vintage = /^\d{4}$/.test(w.vintage) ? Number(w.vintage) : null;
  const plain = wineQueryName(w.producer, w.wineName) || (w.wineName ?? '');
  const alt = wineQueryAltName(w.producer, w.wineName, w.region);

  // 1. Wine-Searcher: the plain name, then the app's fallback name on a miss.
  let p = await call('wine-searcher-proxy', { wineName: plain, vintage, currency: 'GBP' });
  let ws = p?.source === 'wine-searcher' && p?.matched !== false;
  let wsDown = !!p?.down;
  if (!ws && alt && !wsDown) {
    p = await call('wine-searcher-proxy', { wineName: alt, vintage, currency: 'GBP' });
    ws = p?.source === 'wine-searcher' && p?.matched !== false;
    wsDown = !!p?.down;
  }

  // 2. Vinster's wine knowledge.
  const intel = await call('wine-intelligence', {
    producer: w.producer, region: w.region, wineName: w.wineName, vintage: w.vintage,
    style: null, grape: null, currency: 'GBP', wsScore: ws ? (p?.criticScore ?? null) : null, wsScoreScope: null, webResearch: null,
  });
  const identified = intel?.identified === true;
  // An unrecognised wine must come back with every estimate empty.
  const invented = identified ? [] : (['criticScore', 'estimatedValue', 'drinkingWindowFrom', 'tastingNotes', 'insiderNote'] as const)
    .filter((k) => intel?.[k] != null && intel?.[k] !== '');

  // 3. The web check, when neither of the above knows it.
  let web = false;
  if (!ws && !identified) {
    const r = await call('resolve-wine', { producer: w.producer, wineName: w.wineName ?? '', region: w.region, vintage: w.vintage });
    web = r?.found === true;
  }
  return { ws, wsDown, identified, web, invented };
}

// --- Run ---------------------------------------------------------------------

const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
if (signInError) { console.error(`Sign-in failed: ${signInError.message}`); process.exit(2); }

let failures = 0;
console.log('Vinster recognition check\n');
for (const w of WINES) {
  const name = `${w.producer} ${w.wineName ?? ''} ${w.vintage}`.replace(/\s+/g, ' ').trim();
  const started = Date.now();
  try {
    const r = await check(w);
    const secs = ((Date.now() - started) / 1000).toFixed(0);
    const by = [r.ws && 'Wine-Searcher', r.identified && 'Vinster knowledge', r.web && 'web check'].filter(Boolean).join(', ') || 'nothing';
    const recognised = r.ws || r.identified || r.web;
    let ok: boolean; let note: string;
    if (w.expect === 'recognise') {
      ok = recognised;
      note = recognised ? `recognised by ${by}` : `NOT RECOGNISED${r.wsDown ? ' (Wine-Searcher was down)' : ''}`;
    } else {
      ok = !recognised && r.invented.length === 0;
      note = recognised ? `WRONGLY RECOGNISED by ${by}` : r.invented.length ? `INVENTED FACTS: ${r.invented.join(', ')}` : 'correctly not recognised, nothing invented';
    }
    if (!ok) failures++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  — ${note}  (${secs}s)`);
  } catch (e) {
    failures++;
    console.log(`FAIL  ${name}  — error: ${e instanceof Error ? e.message : String(e)}`);
  }
}
console.log(failures ? `\n${failures} failed — do not build until fixed.` : '\nAll passed — safe to build.');
process.exit(failures ? 1 : 0);
