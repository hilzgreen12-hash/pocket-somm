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
function buildPrompt(text: string, domain: string): string {
  const scope = domain === 'food'
    ? 'a dish, ingredient or cooking term'
    : domain === 'query'
    ? "a question the user is asking about their own wine records (it may mention wine producers, appellations/regions, grapes, restaurants and foods)"
    : 'a wine — its producer, appellation/region, grape or cuvée';
  return `A phone's speech-to-text produced the transcript below while the user was speaking ${scope}. STT routinely mangles French / Italian / German / Spanish wine and food terms phonetically. Correct ONLY the misheard words to their proper spelling — wine producers, appellations and regions, grape varieties, dishes and ingredients (e.g. "corn-ass" → "Cornas", "rush omoire" → "Roche aux Moines", "mullingar" → "Mullineux", "solomonie" → "sole meunière"). Preserve the user's exact wording, order and intent otherwise: do NOT answer any question, do NOT add, remove or reorder words, do NOT change ordinary English words. If nothing needs correcting, return the transcript unchanged.

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
    if (original.length > 240) return new Response(JSON.stringify({ text: original }), { headers: { 'Content-Type': 'application/json' } });

    const resp = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: buildPrompt(original, domain) }],
    });
    const out = (resp.content.find((b) => b.type === 'text')?.text ?? '').trim().replace(/^["']+|["']+$/g, '').trim();
    return new Response(JSON.stringify({ text: out || original }), { headers: { 'Content-Type': 'application/json' } });
  } catch (_err) {
    // On any failure, hand back the original so the client keeps the local-corrected text.
    return new Response(JSON.stringify({ text: original }), { headers: { 'Content-Type': 'application/json' } });
  }
});
