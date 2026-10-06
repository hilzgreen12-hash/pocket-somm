import Anthropic from 'npm:@anthropic-ai/sdk';
import { checkRateLimit } from '../_shared/rateLimit.ts';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

const HOURLY_LIMIT = 60;
const DAILY_LIMIT = 300;

// The Discover-tab voice concierge. ONE Claude call classifies the spoken
// request into exactly one of three DISCOVERY intents (never cellar admin), and
// fills only that intent's payload. Ambiguous → "unclear" (we never guess).
//   cellar_mood — recommend from the user's OWN cellar by mood/occasion.
//   consult     — advise between named wines (out at a shop/restaurant) for a dish.
//   intel       — normalise ONE named wine so the app can generate Wine Intel.

interface CmdWine {
  id: string;
  producer?: string | null;
  wineName?: string | null;
  vintage?: string | number | null;
  region?: string | null;
  style?: string | null;
}

function wineLine(w: CmdWine, i: number): string {
  const bits = [w.producer, w.wineName, w.vintage].filter(Boolean).join(' ');
  const extra = [w.region, w.style].filter(Boolean).join('; ');
  return `${i + 1}. [id: ${w.id}] ${bits}${extra ? ` (${extra})` : ''}`;
}

function buildPrompt(transcript: string, wines: CmdWine[]): string {
  const wineBlock = wines.length ? wines.map(wineLine).join('\n') : '(the cellar is empty)';
  return `You are Vinster's voice concierge on the Discover tab. The user spoke ONE request. Classify it into EXACTLY ONE of these three DISCOVERY intents and respond with ONLY raw JSON (no markdown).

INTENTS
1. "cellar_mood" — they want a recommendation of what to drink FROM THEIR OWN CELLAR, describing a mood, occasion, weather or food and clearly drawing on wine they already own (e.g. "it's cold and I want something red, choose from my cellar", "what should I open tonight"). Choose up to THREE bottles from the cellar list below, best first, using ONLY the exact ids. PREFER VARIETY: where the cellar allows, spread the picks across DIFFERENT countries / regions / styles rather than three of the same (e.g. not three Burgundies). Additionally, you MAY include ONE extra "Wild Card" pick — a bottle OUTSIDE what they literally asked for that you feel strongly would delight them given their mood/occasion (e.g. they asked for a refreshing red with no food, but a vibrant white would genuinely hit the spot). For a wild card set its "rank" to "Wild Card" and in "why" say plainly that it's outside their ask and why it still works. Only ever include a wild card when you feel strongly about it; use ONLY the exact ids.
2. "consult" — they are OUT (a shop or restaurant) trying to DECIDE BETWEEN specific named wines/options for a dish or occasion, and want advice on which to pick (e.g. "I'm at a shop deciding between a Cabernet and a Syrah for steak frites", "the Rioja or the Chianti with lamb?"). They name the candidate wines and usually the food. Give a clear recommendation.
3. "intel" — they want information / Wine Intel on ONE specific named wine (e.g. "generate wine intel on Chateau Latour 2005", "tell me about Cloudy Bay Sauvignon Blanc 2022"). Normalise the wine they named.

STRICT RULES
- Choose the SINGLE best-fitting intent. If the request is ambiguous, could plausibly be two intents, is empty/garbled, or you are not confident, return {"intent":"unclear","message":"<one friendly sentence asking them to rephrase, naming the three things they can ask>"}. NEVER guess between intents.
- This voice is for discovery ONLY. If they ask to MOVE, ARCHIVE, ADD, or otherwise manage/organise bottles, return "unclear" and tell them voice here is for cellar recommendations, shop/restaurant advice, or wine intel (cellar changes are done on the Cellar tab).
- Distinguish carefully: "from my cellar / what should I open" ⇒ cellar_mood. "deciding between X and Y / which should I buy/order" ⇒ consult. "wine intel on / tell me about <one wine>" ⇒ intel.

CELLAR (for cellar_mood only — use exact ids):
${wineBlock}

USER SAID: "${transcript}"

Respond with ONLY one of these JSON shapes:
{"intent":"cellar_mood","picks":[{"id":"<id from the list>","rank":"<short evocative label e.g. 'Vinster's First Choice'>","why":"<1-2 sentences tying this wine to their mood>"}]}
{"intent":"consult","question":"<a concise restatement of what they're deciding, e.g. 'Cabernet vs Syrah with steak frites'>","advice":"<2-4 sentences recommending which to choose and why, considering the dish/occasion; name the winner clearly>"}
{"intent":"intel","wine":{"producer":"<producer>","wineName":<cuvée or null>,"region":<region or null>,"vintage":"<4-digit year or NV>","style":<style or null>,"grape":<grape or null>}}
{"intent":"unclear","message":"<friendly rephrase prompt>"}`;
}

Deno.serve(async (req) => {
  try {
    const limited = await checkRateLimit(req, 'discover-voice', HOURLY_LIMIT, DAILY_LIMIT);
    if (limited) return limited;

    const { transcript, wines } = await req.json();
    if (typeof transcript !== 'string' || !transcript.trim()) {
      return new Response(JSON.stringify({ error: 'transcript required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const prompt = buildPrompt(transcript, (wines ?? []) as CmdWine[]);

    const response = await client.messages.create({
      model: 'claude-sonnet-5-5',
      max_tokens: 6000,
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
    console.error('discover-voice error:', message);
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
