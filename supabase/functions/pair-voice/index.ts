import Anthropic from 'npm:@anthropic-ai/sdk';
import { checkRateLimit } from '../_shared/rateLimit.ts';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

const HOURLY_LIMIT = 60;
const DAILY_LIMIT = 300;

// The Pair-tab voice concierge. ONE Claude call classifies the spoken request
// into EXACTLY ONE of three PAIRING intents and fills only that intent's payload.
// Ambiguous → "unclear" (we never guess).
//   cellar_pairing  — recommend a WINE from the user's cellar for a dish.
//   dish_suggestion — suggest a DISH/recipe for a named wine.
//   cookbook_search — find a recipe the user SAVED in their cookbook.

function buildPrompt(transcript: string): string {
  return `You are Vinster's voice concierge on the Pair (food & wine) tab. The user spoke ONE request. Classify it into EXACTLY ONE of these three PAIRING intents and respond with ONLY raw JSON (no markdown).

INTENTS
1. "cellar_pairing" — they want a WINE FROM THEIR OWN CELLAR to open with a dish (e.g. "find me two wines to open with Sole Meunière tonight", "what should I drink from my cellar with roast lamb"). Extract the dish, and how many wines they asked for if stated.
2. "dish_suggestion" — they name a WINE and want a DISH / ingredients / recipe to pair WITH it (e.g. "suggest a dish to pair with Washington Cabernet Franc", "what food goes with a Barolo"). Normalise the wine they named.
3. "cookbook_search" — they want to find a recipe they have ALREADY SAVED in their cookbook, described by the dish and/or the wine it was paired with (e.g. "find me my beef recipe that was paired with Côte Rôtie", "open my saved lamb recipe"). Extract a dish keyword and/or the wine.

STRICT RULES
- Choose the SINGLE best-fitting intent. If the request is ambiguous, could plausibly be two intents, is empty/garbled, or you are not confident, return {"intent":"unclear","message":"<one friendly sentence asking them to rephrase, naming the three things they can ask>"}. NEVER guess between intents.
- Distinguish carefully: a WINE wanted FOR a dish / "open with" / "drink with" ⇒ cellar_pairing. A DISH/food wanted FOR a named wine / "pair a dish with <wine>" ⇒ dish_suggestion. "MY recipe / my saved / from my cookbook / the recipe I paired" ⇒ cookbook_search.
- This voice is for quick pairing ideas only. If they ask to manage the cellar, scan, or review, return "unclear" and point them to the right tab.

USER SAID: "${transcript}"

Respond with ONLY one of these JSON shapes:
{"intent":"cellar_pairing","dish":"<the dish, concise>","count":<number of wines requested, or null>}
{"intent":"dish_suggestion","wine":{"producer":<producer or null>,"wineName":<cuvée or null>,"region":<region or null>,"vintage":<"4-digit year" or "NV" or null>,"grape":<grape or null>,"style":<style or null>}}
{"intent":"cookbook_search","dishQuery":<dish keyword or null>,"wineQuery":<wine name or region or null>}
{"intent":"unclear","message":"<friendly rephrase prompt naming the three things they can ask>"}`;
}

Deno.serve(async (req) => {
  try {
    const limited = await checkRateLimit(req, 'pair-voice', HOURLY_LIMIT, DAILY_LIMIT);
    if (limited) return limited;

    const { transcript } = await req.json();
    if (typeof transcript !== 'string' || !transcript.trim()) {
      return new Response(JSON.stringify({ error: 'transcript required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const prompt = buildPrompt(transcript);

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 700,
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
