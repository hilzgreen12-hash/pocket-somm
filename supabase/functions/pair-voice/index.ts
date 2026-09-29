import Anthropic from 'npm:@anthropic-ai/sdk';
import { checkRateLimit } from '../_shared/rateLimit.ts';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

const HOURLY_LIMIT = 60;
const DAILY_LIMIT = 300;

// The Pair-tab voice concierge. ONE Claude call classifies the spoken request into
// EXACTLY ONE of three pairing intents AND (for the two live intents) writes a
// BROAD, quick answer — deliberately more generic than the full Pair tools, which
// stay the deep-dive option. Ambiguous → "unclear" (we never guess).
//   cellar_pairing  — broad "what sort of wine" reasoning + a few of the user's
//                     own bottles (or market styles if their cellar is empty).
//   dish_suggestion — broad ingredients/flavours to aim for + a few classic combos
//                     for a named wine. NO chef references in this flow.
//   cookbook_search — return search terms; the app matches saved recipes locally.

interface CmdWine {
  producer?: string | null;
  wineName?: string | null;
  vintage?: string | number | null;
  region?: string | null;
  style?: string | null;
}

function wineLine(w: CmdWine, i: number): string {
  const bits = [w.producer, w.wineName, w.vintage].filter(Boolean).join(' ');
  const extra = [w.region, w.style].filter(Boolean).join('; ');
  return `${i + 1}. ${bits}${extra ? ` (${extra})` : ''}`;
}

function buildPrompt(transcript: string, wines: CmdWine[]): string {
  const wineBlock = wines.length ? wines.map(wineLine).join('\n') : '(the cellar is empty)';
  return `You are Vinster's voice concierge on the Pair (food & wine) tab. The user spoke ONE request. Classify it into EXACTLY ONE of three PAIRING intents and respond with ONLY raw JSON (no markdown). For the two live intents you also WRITE the answer — but keep it BROAD and quick: these are shortcuts, not the deep Pair tools. Warm, concise, a few sentences.

INTENTS
1. "cellar_pairing" — they want a WINE (ideally from their own cellar) to drink with a dish (e.g. "find me two wines to open with Sole Meunière tonight"). Write a BROAD answer: 2-4 sentences on the STYLE of wine that suits the dish and WHY (weight, acidity, tannin, flavour bridges), then suggest a FEW specific bottles FROM THE CELLAR LIST below by name if any fit; if the cellar is empty or nothing fits, suggest a few STYLES to look for on the market instead. Do NOT invent bottles the user doesn't own — only name wines from the list.
2. "dish_suggestion" — they name a WINE and want food ideas for it (e.g. "suggest a dish to pair with Washington Cabernet Franc"). Write a BROAD answer: the kinds of INGREDIENTS to lean into and why (with the wine's weight/acidity/tannin/flavours in mind), plus a few classic FLAVOUR COMBINATIONS that work. Keep it general — do NOT write a full recipe and do NOT reference chefs or restaurants.
3. "cookbook_search" — they want a recipe they've ALREADY SAVED in their cookbook, described by dish and/or the wine it was paired with (e.g. "find my beef recipe paired with Côte Rôtie"). Extract search terms only.

STRICT RULES
- Choose the SINGLE best-fitting intent. If ambiguous, empty/garbled, or you are not confident, return {"intent":"unclear","message":"<one friendly sentence naming the three things they can ask>"}. NEVER guess.
- Distinguish: a WINE wanted FOR a dish ⇒ cellar_pairing. FOOD wanted FOR a wine ⇒ dish_suggestion. "MY saved recipe / from my cookbook" ⇒ cookbook_search.

THE USER'S CELLAR (for cellar_pairing suggestions — name only these):
${wineBlock}

USER SAID: "${transcript}"

Respond with ONLY one of these JSON shapes:
{"intent":"cellar_pairing","question":"<the dish, concise>","advice":"<broad style reasoning + a few named cellar bottles, or market styles if none fit>"}
{"intent":"dish_suggestion","question":"<the wine, concise>","advice":"<broad ingredients/flavours + a few classic combinations; no recipe, no chefs>"}
{"intent":"cookbook_search","dishQuery":<dish keyword or null>,"wineQuery":<wine name or region or null>}
{"intent":"unclear","message":"<friendly rephrase prompt naming the three things they can ask>"}`;
}

Deno.serve(async (req) => {
  try {
    const limited = await checkRateLimit(req, 'pair-voice', HOURLY_LIMIT, DAILY_LIMIT);
    if (limited) return limited;

    const { transcript, wines } = await req.json();
    if (typeof transcript !== 'string' || !transcript.trim()) {
      return new Response(JSON.stringify({ error: 'transcript required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const prompt = buildPrompt(transcript, (wines ?? []) as CmdWine[]);

    const response = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content.find((b) => b.type === 'text')?.text ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`No JSON found: ${text.slice(0, 200)}`);

    const parsed = JSON.parse(match[0]);
    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('pair-voice error:', message);
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
