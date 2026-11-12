import Anthropic from 'npm:@anthropic-ai/sdk';
import { checkRateLimit } from '../_shared/rateLimit.ts';
import { HOUSE_RULES } from '../_shared/houseRules.ts';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

const HOURLY_LIMIT = 60;
const DAILY_LIMIT = 300;

// The guided Home Voice Command. The app collects the user's answers step by
// step (Vinster asks; the user answers) and calls this once at the end of a
// flow with everything it gathered:
//   mode "cellar_picks" — Choose from my cellar: three bottles from the user's
//                         OWN cellar for the dish / mood / decant / budget.
//   mode "decide"       — Decide between wines: rank the 2–4 wines the user has
//                         narrowed down to (with Wine-Searcher market data when
//                         the chat sends it: per-wine value notes + best value).
//   mode "compare"      — Generate Intelligence, compare: side-by-side rows on
//                         what the user asked (critic scores, price, readiness).
//   mode "buy_picks"    — Pair, wine for my dish, buying: candidate real bottles
//                         (the app keeps only Wine-Searcher-verified ones).
//   mode "ingredients"  — Pair, dish for my wine: classic pairing ingredients.

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
  // Two clients: the original app sends decant 'now'|'time' + a numeric budget;
  // the chat version sends the user's own words (decantText / budgetText).
  const decantWords = typeof b.decantText === 'string' && b.decantText.trim() ? b.decantText.trim() : null;
  const timeToDecant = decantWords ? !/\b(now|straight away|right away|immediately|no time)\b/i.test(decantWords) : b.decant === 'time';
  // Pair's "wine for my dish" never asks about decanting: say nothing about it.
  const decantAsked = !!decantWords || b.decant === 'now' || b.decant === 'time';
  const decantLine = !decantAsked ? 'not discussed — make no decanting assumptions'
    : decantWords ? `${decantWords} (their words — honour any time limit they gave)`
    : timeToDecant ? 'they have time to decant' : 'opening now — no time to decant, so favour bottles drinking well straight away';
  const budgetWords = typeof b.budgetText === 'string' && b.budgetText.trim() ? b.budgetText.trim() : null;
  const budget = budgetWords
    ? `${budgetWords} (their words, in ${b.currency ?? 'GBP'}; use market value as the guide, a little either side is fine; if they said no preference, ignore price)`
    : typeof b.budget === 'number' ? `${b.currency ?? 'GBP'} ${b.budget} a bottle (use market value as the guide; a little either side is fine)` : 'no budget preference';
  // When Serving Suggestions are offered they carry the ONLY decant time, so the
  // picks must not generate a second one that could disagree.
  const noDecant = b.serving === true;
  const exclude: string[] = Array.isArray(b.excludeIds) ? b.excludeIds : [];
  return `${VOICE}

The user wants you to choose THREE bottles from THEIR OWN CELLAR (below — use ONLY these exact ids).

WHAT THEY TOLD YOU
- Eating: ${b.eating || 'not specified'}
- Occasion or mood: ${b.occasion || 'not specified'}
- Decanting: ${decantLine}
- Budget: ${budget}

RULES
- Pick the three best fits, best first. Prefer variety across countries / regions / styles where the cellar allows.
- Take their words literally; don't invent preferences they didn't give.
- rank labels: "Top pick", "Runner up", "Wildcard" (Wildcard = a less obvious bottle you feel strongly about).
- why: ONE sentence tying the wine to the food and mood.
${noDecant || !decantAsked ? '- decant: null.' : timeToDecant ? '- decant: the optimal decanting time for THIS bottle within the time they have, e.g. "Decant for about 1 hour". Base it on the wine\'s age, structure and style.' : '- decant: null.'}
${exclude.length ? `- ALTERNATIVE SELECTION: they asked for different suggestions. Avoid these ids: ${exclude.join(', ')}. Only repeat one if you feel strongly it is still the best choice, and then say why in its "why".` : ''}
${b.styleBrief === true
  ? `- brief: lead with the STYLE of wine the dish needs, in EXACTLY this shape: "For <dish, short, lower case> you need a wine that is <2–4 qualities, e.g. silky, earthy and medium-bodied with bright acidity>, such as <a classic example style, e.g. a Central Otago Pinot Noir> or <a second, different example, e.g. a bright, youthful Rioja>. From your cellar I recommend:". The two examples are STYLES/regions to illustrate, not bottles from the cellar. If fewer than three cellar wines suit, end with "From your cellar, the closest matches are:" instead.`
  : `- brief: one line in EXACTLY this shape, filled in from what they said: "Three wines chosen from your cellar for <dish, short>${b.occasion ? ', <occasion, short>' : ''}, <decanting, short> and <budget, short>". Leave out any part they didn't give. If they gave no dish, describe the mood instead.`}
- If the cellar has fewer than three suitable wines, return as many as fit.

CELLAR
${wines.length ? wines.map(cellarLine).join('\n') : '(empty)'}

Respond with ONLY raw JSON:
{"brief":"<line>","picks":[{"id":"<exact id>","rank":"Top pick","why":"<sentence>","decant":<string or null>}]}`;
}

interface MarketIn { avg?: number | null; min?: number | null; max?: number | null; currency?: string | null }

function decidePrompt(b: any): string {
  const wines: string[] = Array.isArray(b.wines) ? b.wines.filter((w: unknown) => typeof w === 'string' && w.trim()) : [];
  const market: (MarketIn | null)[] = Array.isArray(b.market) ? b.market : [];
  const marketLine = (i: number) => {
    const m = market[i];
    if (!m || m.avg == null) return 'no Wine-Searcher listing found';
    const cur = m.currency ?? 'GBP';
    return `Wine-Searcher average ${cur} ${Math.round(m.avg)}${m.min != null && m.max != null ? ` (range ${Math.round(m.min)}–${Math.round(m.max)})` : ''}`;
  };
  const withMarket = market.length > 0;
  return `${VOICE}

The user has narrowed their choice down to these wines and wants you to say which to open / buy:
${wines.map((w, i) => `${i + 1}. ${w}${withMarket ? ` — ${marketLine(i)}` : ''}`).join('\n')}

- Eating: ${b.eating || 'not specified'}
- Occasion or mood: ${b.occasion || 'not specified'}

RULES
- NEVER INVENT: names are dictated and may be misheard. Only make producer-specific claims (rarity, reputation, price, critic standing) about a wine you GENUINELY recognise. If you don't recognise one, keep its name exactly as given (no "tidying" into a different wine), say plainly in its text that you don't know it ("I don't know this bottle, so I've judged it on what you told me"), and make no rarity / price / reputation claims about it. Prefer the wine you know when the fit is otherwise close.
- PRICES: use ONLY the Wine-Searcher figures given above. Never state or estimate a price for a wine with no listing.
- Choose ONE pick and ONE runner up. Ignore any others.
- The occasion genuinely matters: weigh rarity, uniqueness, producer reputation and price point against the occasion (a widely available everyday bottle suits a casual night; something rarer suits a special one).
- headline: EXACTLY this shape — "I recommend the <short name of the pick>, for <dish, short> <occasion phrase>. Here's why…" (if no dish, use the occasion alone).
- withFood: 1–2 sentences on why the pick suits the food (or the moment, if no food).
- forOccasion: 2 sentences on rarity / reputation / uniqueness / price point and why that fits the occasion.
- runnerUpWhy: 1–2 sentences: what's good about it AND why it came second.
- pickName / runnerUpName / names[i]: full tidy names "Producer · Wine · Vintage" (omit parts you don't know).
${withMarket ? `- valueNotes[i]: ONE sentence per wine (same order) on how its market price reads as value for what it is. For a wine with no listing, say there's no market listing to compare.
- bestValueIndex: 1-based index of the best value among wines WITH a listing (null if none have one).
- marketSummary: ONE sentence leading into your recommendation, e.g. "The Mullineux gives you the most wine for your money, and it suits the occasion too. Here's my recommendation…".` : ''}

Respond with ONLY raw JSON:
{"headline":"...","pickIndex":<1-based>,"pickName":"...","withFood":"...","forOccasion":"...","runnerUpIndex":<1-based>,"runnerUpName":"...","runnerUpWhy":"..."${withMarket ? ',"names":["..."],"valueNotes":["..."],"bestValueIndex":<1-based or null>,"marketSummary":"..."' : ''}}`;
}

function comparePrompt(b: any): string {
  const wines: string[] = Array.isArray(b.wines) ? b.wines.filter((w: unknown) => typeof w === 'string' && w.trim()) : [];
  const market: any[] = Array.isArray(b.market) ? b.market : [];
  const line = (w: string, i: number) => {
    const m = market[i] ?? {};
    const bits = [
      m.criticScore != null ? `Wine-Searcher critic score ${m.criticScore}/100` : null,
      m.avg != null ? `Wine-Searcher average ${m.currency ?? 'GBP'} ${Math.round(m.avg)}${m.min != null && m.max != null ? ` (range ${Math.round(m.min)}–${Math.round(m.max)})` : ''}` : null,
    ].filter(Boolean).join('; ');
    return `${i + 1}. ${w}${bits ? ` — ${bits}` : ' — no Wine-Searcher listing'}`;
  };
  return `${VOICE}

The user wants to compare these wines side by side:
${wines.map(line).join('\n')}

What they want compared (their words): "${b.measure || 'overall'}"

RULES
- NEVER INVENT. Names may be misheard. Only describe a wine you GENUINELY recognise; for one you don't, keep the name as given and say "Vinster doesn't know this wine well enough to compare it" in its note, with figure null.
- Critic scores and prices: use ONLY the Wine-Searcher figures given. For critic scores you may use a score you genuinely know was published for that exact wine and vintage; otherwise null. Never estimate a number.
- Drinking readiness: from the vintage and the wine's known style; say "drinking now", "approaching", "needs time" etc. with a year range only if you genuinely know it.
- intro: ONE short line, e.g. "Here's how the critics rate your three wines".
- rows: one per wine, ranked best first for what they asked. name = tidy "Producer · Wine · Vintage". figure = the headline figure as short text (e.g. "98/100", "£25 · Range £21–£32", "Drinking now") or null. note = ONE sentence. tag = "Highest rated" / "Best value" / "Readiest" etc. on the top row only, else null. index = the wine's original 1-based number.
- closing: ONE sentence summing up.

Respond with ONLY raw JSON:
{"intro":"...","rows":[{"index":1,"name":"...","figure":"..." or null,"note":"...","tag":"..." or null}],"closing":"..."}`;
}

function buyPrompt(b: any): string {
  const exclude: string[] = Array.isArray(b.exclude) ? b.exclude : [];
  return `${VOICE}

The user is cooking: "${b.dish || 'not specified'}". They want wines to BUY. Budget (their words, in ${b.currency ?? 'GBP'}): ${b.budgetText || 'not specified'}.

Suggest SIX specific, real, widely available bottles (producer + wine, no vintage) that pair well, best first, spanning different countries where possible. They will be checked against Wine-Searcher and only real listings shown, so ONLY name bottles you genuinely know exist; never invent one.
${exclude.length ? `They asked for an alternative selection: do NOT suggest any of these again: ${exclude.join('; ')}.` : ''}
- brief: one line in EXACTLY this shape: "Three wines to look for, for <dish, short>${b.budgetText ? ', <budget, short>' : ''}".
- why: ONE sentence tying the wine to the dish.

Respond with ONLY raw JSON:
{"brief":"...","candidates":[{"producer":"...","wine":"...","region":"...","why":"..."}]}`;
}

function ingredientsPrompt(b: any): string {
  return `${VOICE}

List classic pairing INGREDIENTS (not recipes) for this wine: "${b.wine || ''}".
Allergies or strong preferences to respect (their words): ${b.allergies || 'none given'}. Leave out anything that conflicts.

RECOGNITION GATE: if you don't genuinely recognise this as a real wine (it may be misheard), base the list ONLY on the grape / region / style it names and make no producer-specific claims. If you can't even place the style, return {"identified":false}.
- intro: "Classic pairing ingredients for <tidy wine name>".
- groups: 4–6 groups such as "Meat and game", "Fish and shellfish", "Savoury", "Herbs and spice", "Earthy", "Fruit", "Cheese" — only those that suit the wine. Each has 3–5 ingredients as one comma-separated line.

Respond with ONLY raw JSON:
{"identified":true,"intro":"...","groups":[{"label":"...","items":"..."}]}`;
}

Deno.serve(async (req) => {
  try {
    const limited = await checkRateLimit(req, 'home-voice', HOURLY_LIMIT, DAILY_LIMIT);
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    let prompt: string;
    if (body.mode === 'cellar_picks') prompt = cellarPrompt(body);
    else if (body.mode === 'decide') prompt = decidePrompt(body);
    else if (body.mode === 'compare') prompt = comparePrompt(body);
    else if (body.mode === 'buy_picks') prompt = buyPrompt(body);
    else if (body.mode === 'ingredients') prompt = ingredientsPrompt(body);
    else {
      return new Response(JSON.stringify({ error: 'unknown mode' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const response = await client.messages.create({
      system: HOUSE_RULES,
      model: 'claude-sonnet-5-5',
      max_tokens: 2500,
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
