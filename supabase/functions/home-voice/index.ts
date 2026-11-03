import Anthropic from 'npm:@anthropic-ai/sdk';
import { checkRateLimit } from '../_shared/rateLimit.ts';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

const HOURLY_LIMIT = 60;
const DAILY_LIMIT = 300;

// The guided Home Voice Command. The app collects the user's answers step by
// step (Vinster asks; the user answers) and calls this once at the end of a
// flow with everything it gathered:
//   mode "cellar_picks" — Choose from my cellar: three bottles from the user's
//                         OWN cellar for the dish / mood / decant / budget.
//   mode "decide"       — Help me decide: rank the 2–4 wines the user has
//                         narrowed down to, for the dish and occasion.

interface CellarWineIn {
  id: string;
  producer?: string | null;
  wineName?: string | null;
  vintage?: string | number | null;
  region?: string | null;
  style?: string | null;
  grape?: string | null;
  value?: number | null;
  currency?: string | null;
  windowFrom?: string | number | null;
  windowTo?: string | number | null;
}

function cellarLine(w: CellarWineIn, i: number): string {
  const name = [w.producer, w.wineName, w.vintage].filter(Boolean).join(' ');
  const extra = [
    w.region, w.grape, w.style,
    w.value != null ? `market ~${w.currency ?? 'GBP'} ${Math.round(w.value)}` : null,
    w.windowFrom && w.windowTo ? `drink ${w.windowFrom}–${w.windowTo}` : null,
  ].filter(Boolean).join('; ');
  return `${i + 1}. [id: ${w.id}] ${name}${extra ? ` (${extra})` : ''}`;
}

const VOICE = `Write as Vinster: a warm, knowledgeable sommelier friend — precise, never gushing, British English. Short sentences.`;

function cellarPrompt(b: any): string {
  const wines: CellarWineIn[] = Array.isArray(b.wines) ? b.wines : [];
  const timeToDecant = b.decant === 'time';
  const budget = typeof b.budget === 'number' ? `${b.currency ?? 'GBP'} ${b.budget} a bottle (use market value as the guide; a little either side is fine)` : 'no budget preference';
  return `${VOICE}

The user wants you to choose THREE bottles from THEIR OWN CELLAR (below — use ONLY these exact ids).

WHAT THEY TOLD YOU
- Eating: ${b.eating || 'not specified'}
- Occasion or mood: ${b.occasion || 'not specified'}
- Decanting: ${timeToDecant ? 'they have time to decant' : 'opening now — no time to decant, so favour bottles drinking well straight away'}
- Budget: ${budget}

RULES
- Pick the three best fits, best first. Prefer variety across countries / regions / styles where the cellar allows.
- Take their words literally; don't invent preferences they didn't give.
- rank labels: "Top pick", "Runner up", "Wildcard" (Wildcard = a less obvious bottle you feel strongly about).
- why: ONE sentence tying the wine to the food and mood.
${timeToDecant ? '- decant: the optimal decanting time for THIS bottle, e.g. "Decant for about 1 hour", "Decant for 30–45 minutes", "Decant for 1½–2 hours". Base it on the wine\'s age, structure and style.' : '- decant: null.'}
- brief: one line in EXACTLY this shape, filled in from what they said: "Three wines chosen from your cellar for <dish, short>, <${timeToDecant ? 'with time to decant' : 'no time to decant'}> and <${typeof b.budget === 'number' ? 'around <budget> a bottle' : 'no budget in mind'}>". If they gave no dish, describe the mood instead.
- If the cellar has fewer than three suitable wines, return as many as fit.

CELLAR
${wines.length ? wines.map(cellarLine).join('\n') : '(empty)'}

Respond with ONLY raw JSON:
{"brief":"<line>","picks":[{"id":"<exact id>","rank":"Top pick","why":"<sentence>","decant":<string or null>}]}`;
}

function decidePrompt(b: any): string {
  const wines: string[] = Array.isArray(b.wines) ? b.wines.filter((w: unknown) => typeof w === 'string' && w.trim()) : [];
  return `${VOICE}

The user has narrowed their choice down to these wines and wants you to say which to open / buy:
${wines.map((w, i) => `${i + 1}. ${w}`).join('\n')}

- Eating: ${b.eating || 'not specified'}
- Occasion or mood: ${b.occasion || 'not specified'}

RULES
- Take each wine exactly as they described it (producer, cuvée, vintage); tidy the name's spelling/capitalisation only.
- NEVER INVENT: names are dictated and may be misheard. Only make producer-specific claims (rarity, reputation, price, critic standing) about a wine you GENUINELY recognise. If you don't recognise one, keep its name exactly as given (no "tidying" into a different wine), say plainly in its text that you don't know it ("I don't know this bottle, so I've judged it on what you told me"), and make no rarity / price / reputation claims about it. Prefer the wine you know when the fit is otherwise close.
- Choose ONE pick and ONE runner up. Ignore any others.
- The occasion genuinely matters: weigh rarity, uniqueness, producer reputation and price point against the occasion (a widely available everyday bottle suits a casual night; something rarer suits a special one).
- headline: EXACTLY this shape — "I recommend the <short name of the pick>, for <dish, short> <occasion phrase>. Here's why…" (if no dish, use the occasion alone).
- withFood: 1–2 sentences on why the pick suits the food (or the moment, if no food).
- forOccasion: 2 sentences on rarity / reputation / uniqueness / price point and why that fits the occasion.
- runnerUpWhy: 1–2 sentences: what's good about it AND why it came second.
- pickName / runnerUpName: full tidy names "Producer · Wine · Vintage" (omit parts you don't know).

Respond with ONLY raw JSON:
{"headline":"...","pickIndex":<1-based>,"pickName":"...","withFood":"...","forOccasion":"...","runnerUpIndex":<1-based>,"runnerUpName":"...","runnerUpWhy":"..."}`;
}

Deno.serve(async (req) => {
  try {
    const limited = await checkRateLimit(req, 'home-voice', HOURLY_LIMIT, DAILY_LIMIT);
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    let prompt: string;
    if (body.mode === 'cellar_picks') prompt = cellarPrompt(body);
    else if (body.mode === 'decide') prompt = decidePrompt(body);
    else {
      return new Response(JSON.stringify({ error: 'unknown mode' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-5-5',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = response.content.find((b) => b.type === 'text')?.text ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`No JSON found: ${text.slice(0, 200)}`);
    return new Response(match[0], { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('home-voice error:', message);
    return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
});
