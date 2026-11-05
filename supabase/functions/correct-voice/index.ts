import Anthropic from 'npm:@anthropic-ai/sdk';
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
async function soundsLike(text: string): Promise<string[]> {
  try {
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) return [];
    const res = await fetch(`${url}/rest/v1/rpc/catalog_sounds_like`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, lim: 12 }),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    const rows = await res.json() as { producer: string; wine_name: string | null; region: string | null }[];
    return rows.map((r) => [r.producer, r.wine_name, r.region ? `(${r.region})` : ''].filter(Boolean).join(' '));
  } catch {
    return [];
  }
}

function buildPrompt(text: string, domain: string, candidates: string[] = []): string {
  const scope = domain === 'food'
    ? 'a dish, ingredient or cooking term'
    : domain === 'note'
    ? 'a personal tasting note or memory about wine and food (it may mention wine producers, appellations/regions, grapes, restaurants and dishes)'
    : domain === 'query'
    ? "a question the user is asking about their own wine records (it may mention wine producers, appellations/regions, grapes, restaurants and foods)"
    : 'a wine — its producer, appellation/region, grape or cuvée';
  return `A phone's speech-to-text produced the transcript below while the user was speaking ${scope}. STT routinely mangles French / Italian / German / Spanish wine and food terms phonetically. Correct ONLY the misheard words to their proper spelling — wine producers, appellations and regions, grape varieties, dishes and ingredients (e.g. "corn-ass" → "Cornas", "rush omoire" → "Roche aux Moines", "mullingar" → "Mullineux", "solomonie" → "sole meunière"). Preserve the user's exact wording, order and intent otherwise: do NOT answer any question, do NOT add, remove or reorder words, do NOT change ordinary English words. If nothing needs correcting, return the transcript unchanged.

NEVER INVENT OR SPLICE WINES: a corrected wine must be a REAL wine — ideally one of the catalogue wines listed below, spelled exactly as listed. Never combine parts of different wines or appellations into a new name (e.g. never turn "francois cotat mont damnees" into "Francia Côte de Nuits Domaine Bizot" — it is François Cotat, Les Monts Damnés). If you are not confident which real wine was meant, leave those words exactly as spoken.

${candidates.length ? `\nWines in Vinster's catalogue that sound like what was said (the speaker very likely meant one of these if the sounds match — use its correct spelling; a producer may be spoken by the winemaker's name, e.g. "Eben Sadie" for Sadie Family Wines, so keep the speaker's form but spell it correctly):\n${candidates.map((c) => `- ${c}`).join('\n')}\n` : ''}
Transcript: "${text}"

Return ONLY the corrected transcript as plain text — no quotes, no notes.`;
}

Deno.serve(async (req) => {
  let original = '';
  try {
    const limited = await checkRateLimit(req, 'correct-voice', HOURLY_LIMIT, DAILY_LIMIT);
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
    const candidates = isWine ? await soundsLike(original) : [];
    const resp = await client.messages.create({
      model: isWine ? 'claude-sonnet-5-5' : 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: buildPrompt(original, domain, candidates) }],
    });
    const out = (resp.content.find((b) => b.type === 'text')?.text ?? '').trim().replace(/^["']+|["']+$/g, '').trim();
    return new Response(JSON.stringify({ text: out || original }), { headers: { 'Content-Type': 'application/json' } });
  } catch (_err) {
    // On any failure, hand back the original so the client keeps the local-corrected text.
    return new Response(JSON.stringify({ text: original }), { headers: { 'Content-Type': 'application/json' } });
  }
});
