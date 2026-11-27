import Anthropic from 'npm:@anthropic-ai/sdk';
import { requireSignedIn } from '../_shared/auth.ts';
import { checkRateLimit } from '../_shared/rateLimit.ts';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

const HOURLY_LIMIT = 300;
const DAILY_LIMIT = 1500;

// Correct a phone speech-to-text transcript of a spoken wine/food term (or a
// question that mentions them). On-device STT mangles French/Italian/German wine
// and food vocabulary phonetically — "corn-ass"→"Cornas", "rush omoire"→"Roche
// aux Moines", "solomonie"→"sole meunière". The hand-written dictionary can't
// keep up with the long tail, so this LLM pass fixes the misheard WORDS only,
// leaving the user's wording and intent untouched.
// Closest-sounding wines in Vinster's catalogue (migration 120). Gives the model
// a short list of real answers to snap a mangled name to — the same grounding the
// Cellar voice command gets from the user's own wines. Best-effort: [] on error.
const URL_ = Deno.env.get('SUPABASE_URL');
const KEY_ = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const restHeaders = () => ({ apikey: KEY_!, Authorization: `Bearer ${KEY_}`, 'Content-Type': 'application/json' });

type SoundRow = { producer: string; wine_name: string | null; region: string | null; grape?: string | null; style?: string | null };

async function soundsLike(text: string): Promise<SoundRow[]> {
  try {
    if (!URL_ || !KEY_) return [];
    const res = await fetch(`${URL_}/rest/v1/rpc/catalog_sounds_like`, {
      method: 'POST',
      headers: restHeaders(),
      body: JSON.stringify({ q: text, lim: 20 }),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    return await res.json() as SoundRow[];
  } catch {
    return [];
  }
}

// When the speaker names an appellation ("… Châteauneuf-du-Pape 2012"), the
// sound-alike rows cluster on it — but a badly misheard producer ("Broadcast"
// for Beaucastel) shares too few sounds to surface. So hand the model every
// producer the catalogue holds for that appellation, to pick from by sound.
async function appellationProducers(text: string, rows: SoundRow[]): Promise<{ appellation: string; producers: string[] } | null> {
  try {
    if (!URL_ || !KEY_ || rows.length < 3) return null;
    // Only when the speaker actually SAID the appellation — a producer that
    // merely sounds like the results ("roc do comb" → Combier, Crozes-Hermitage)
    // must not pull in a whole appellation's producer list.
    const spoken = ` ${wordsOf(text).join(' ')} `;
    const said = (a: string) => {
      const key = wordsOf(a).filter((w) => w.length >= 4 && !['saint', 'sainte', 'villages', 'superiore', 'classico', 'grand', 'premier'].includes(w));
      return key.length > 0 && key.every((w) => spoken.includes(` ${w} `));
    };
    const counts = new Map<string, number>();
    for (const r of rows) {
      const a = (r.region ?? '').split(',')[0].trim();
      if (a && said(a)) counts.set(a, (counts.get(a) ?? 0) + 1);
    }
    const [top] = [...counts.entries()].sort((x, y) => y[1] - x[1]);
    if (!top) return null;
    const appellation = top[0];
    const q = `${URL_}/rest/v1/wines_catalog?select=producer&region=ilike.${encodeURIComponent(`${appellation}*`)}&verification_status=not.in.(implausible,needs_review)&limit=2000`;
    const res = await fetch(q, { headers: restHeaders(), signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const list = [...new Set((await res.json() as { producer: string }[]).map((r) => r.producer).filter(Boolean))].slice(0, 250);
    return list.length ? { appellation, producers: list } : null;
  } catch {
    return null;
  }
}

const fold = (t: string) => t.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const wordsOf = (t: string) => fold(t).split(/[^a-z0-9]+/).filter(Boolean);

// The model may only bring in names that were on the lists it was given — a
// replaced word must come from those lists, or be a real region / grape word in
// the catalogue. Anything else (a real wine pulled from memory, like "Broadbent"
// for "Broadcast") means it guessed: keep what the user said instead.
async function onlyKnownNames(original: string, out: string, allowedText: string): Promise<boolean> {
  const had = new Set(wordsOf(original));
  const allowed = new Set(wordsOf(allowedText));
  const fresh = [...new Set(wordsOf(out))].filter((w) => !had.has(w) && !allowed.has(w) && w.length >= 3 && !/^\d+$/.test(w));
  if (!fresh.length) return true;
  if (!URL_ || !KEY_) return false;
  const checks = await Promise.all(fresh.map(async (w) => {
    try {
      // w is accent-folded but the catalogue stores accents ("Grüner"), so let
      // each vowel / c / n match any single letter (ilike "_").
      const p = encodeURIComponent(w.replace(/[aeiouycn]/g, '_'));
      const q = `${URL_}/rest/v1/wines_catalog?select=id&or=(region.ilike.*${p}*,grape.ilike.*${p}*)&limit=1`;
      const res = await fetch(q, { headers: restHeaders(), signal: AbortSignal.timeout(2500) });
      return res.ok && ((await res.json()) as unknown[]).length > 0;
    } catch { return false; }
  }));
  return checks.every(Boolean);
}

function buildPrompt(text: string, domain: string, candidates: string[] = [], appellation: { appellation: string; producers: string[] } | null = null): string {
  const scope = domain === 'food'
    ? 'a dish, ingredient or cooking term'
    : domain === 'note'
    ? 'a personal tasting note or memory about wine and food (it may mention wine producers, appellations/regions, grapes, restaurants and dishes)'
    : domain === 'query'
    ? "a question the user is asking about their own wine records (it may mention wine producers, appellations/regions, grapes, restaurants and foods)"
    : 'a wine — its producer, appellation/region, grape or cuvée';
  return `A phone's speech-to-text produced the transcript below while the user was speaking ${scope}. STT routinely mangles French / Italian / German / Spanish wine and food terms phonetically. Correct ONLY the misheard words to their proper spelling — wine producers, appellations and regions, grape varieties, dishes and ingredients (e.g. "corn-ass" → "Cornas", "rush omoire" → "Roche aux Moines", "mullingar" → "Mullineux", "solomonie" → "sole meunière"). Preserve the user's exact wording, order and intent otherwise: do NOT answer any question, do NOT add, remove or reorder words, do NOT change ordinary English words. If nothing needs correcting, return the transcript unchanged.

NEVER INVENT OR SPLICE WINES: a corrected wine must be a REAL wine — ideally one of the catalogue wines listed below, spelled exactly as listed. Never combine parts of different wines or appellations into a new name (e.g. never turn "francois cotat mont damnees" into "Francia Côte de Nuits Domaine Bizot" — it is François Cotat, Les Monts Damnés). If you are not confident which real wine was meant, leave those words exactly as spoken. An ordinary English word the transcript contains (e.g. "broadcast", "sugar", "candle") is only a mishearing if the wine you'd replace it with sounds nearly the same as the WHOLE word, or the rest of what was said (an appellation, region or grape) points to that wine — sharing just a first syllable ("broadcast" → "Broadbent") is not enough; leave it as spoken.

${appellation ? `\nProducers of ${appellation.appellation} in Vinster's catalogue (if the speaker named this appellation, a misheard producer word very likely means one of these — pick the one that SOUNDS like what was said, e.g. "broadcast" → "Beaucastel"):\n${appellation.producers.join('; ')}\n` : ''}${candidates.length ? `\nWines in Vinster's catalogue that sound like what was said (the speaker very likely meant one of these if the sounds match — use its correct spelling; a producer may be spoken by the winemaker's name, e.g. "Eben Sadie" for Sadie Family Wines, so keep the speaker's form but spell it correctly):\n${candidates.map((c) => `- ${c}`).join('\n')}\n` : ''}
Transcript: "${text}"

Return ONLY the corrected transcript as plain text — no quotes, no notes.`;
}

Deno.serve(async (req) => {
  let original = '';
  try {
    const auth = await requireSignedIn(req);
    if (auth instanceof Response) return auth;
    const limited = await checkRateLimit(auth.userId, 'correct-voice', HOURLY_LIMIT, DAILY_LIMIT);
    if (limited) return limited;
    const body = await req.json();
    original = typeof body?.text === 'string' ? body.text : '';
    const domain = typeof body?.domain === 'string' ? body.domain : 'wine';
    if (!original.trim()) return new Response(JSON.stringify({ text: original }), { headers: { 'Content-Type': 'application/json' } });
    // Guard against rewriting long free-text (e.g. a whole tasting note) — only
    // short, name-heavy utterances are corrected here.
    if (original.length > (domain === 'note' ? 600 : 240)) return new Response(JSON.stringify({ text: original }), { headers: { 'Content-Type': 'application/json' } });

    // Wine names get catalogue grounding and the stronger model — the long tail
    // of producers (e.g. "Even CD Colmela" → "Eben Sadie Columella") is beyond the
    // small model. Food stays on the fast model.
    const isWine = domain !== 'food';
    // Only the wine-name domain is held to the catalogue lists: notes and
    // queries also hold dishes and restaurants ("solomonie" → "sole meunière").
    const nameOnly = domain === 'wine';
    const rows = isWine ? await soundsLike(original) : [];
    const appellation = nameOnly ? await appellationProducers(original, rows) : null;
    const candidates = rows.map((r) => [r.producer, r.wine_name, r.region ? `(${r.region})` : ''].filter(Boolean).join(' '));
    const resp = await client.messages.create({
      model: isWine ? 'claude-sonnet-5-5' : 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: buildPrompt(original, domain, candidates, appellation) }],
    });
    let out = (resp.content.find((b) => b.type === 'text')?.text ?? '').trim().replace(/^["']+|["']+$/g, '').trim();
    // Wine corrections must come from the lists Vinster gave — never a
    // different real wine from the model's memory.
    if (nameOnly && out && out !== original) {
      // Include the sound-alike rows' region / grape / style text too, so
      // accented words ("Grüner", "Châteauneuf") compare folded.
      const extra = rows.flatMap((r) => [r.region, r.grape, r.style]).filter(Boolean);
      const allowedText = [...candidates, ...extra, ...(appellation?.producers ?? [])].join(' ');
      if (!(await onlyKnownNames(original, out, allowedText))) out = original;
    }
    return new Response(JSON.stringify({ text: out || original }), { headers: { 'Content-Type': 'application/json' } });
  } catch (_err) {
    // On any failure, hand back the original so the client keeps the local-corrected text.
    return new Response(JSON.stringify({ text: original }), { headers: { 'Content-Type': 'application/json' } });
  }
});
