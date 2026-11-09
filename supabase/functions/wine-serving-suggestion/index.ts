import Anthropic from 'npm:@anthropic-ai/sdk';
import { checkRateLimit } from '../_shared/rateLimit.ts';
import { HOUSE_RULES } from '../_shared/houseRules.ts';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

const HOURLY_LIMIT = 90;
const DAILY_LIMIT = 400;

// Generate "how to serve THIS wine" on demand for a cellar wine card: serving
// temperature, decanting, glassware, plus a wine style to enjoy before (aperitif)
// and after (digestif). No dish context — this is about the wine itself.
function buildPrompt(w: { producer?: string; wineName?: string; region?: string; vintage?: string; grape?: string; style?: string; decantTime?: string }): string {
  const identity = [w.producer, w.wineName, w.vintage].filter(Boolean).join(' ')
    + [w.region ? `, ${w.region}` : '', w.grape ? ` (${w.grape})` : '', w.style ? ` — ${w.style}` : ''].join('');
  return `You are a world-class sommelier. Give concise, practical serving guidance for this specific wine.

Wine: ${identity}
${w.decantTime ? `\nTime available before serving (the user's words): "${w.decantTime}". Your decanting advice must fit within it; if the wine would ideally need longer, say so and give the best option within their time.\n` : ''}
Return ONLY valid JSON with this structure:
{
  "temperature": "ideal serving temperature, e.g. '16-18°C, slightly cool'",
  "temperatureReason": "1 short sentence why that temperature suits THIS wine",
  "decant": "whether to decant and for how long, e.g. 'Decant 45-60 min' or 'No need to decant'",
  "decantReason": "1 short sentence why",
  "glassware": "the glass to use, e.g. 'Large Burgundy bowl' or 'Standard white-wine glass'",
  "glasswareReason": "1 short sentence why that glass suits it",
  "aperitif": {
    "style": "a lighter wine STYLE to serve BEFORE this wine, e.g. 'Crémant de Loire'",
    "reason": "1 short sentence why — a palate-friendly opener, nothing too heavy"
  },
  "digestif": {
    "style": "a wine STYLE to serve AFTER this wine, e.g. 'LBV Port'",
    "reason": "1 short sentence why it follows this wine well"
  }
}

Tailor every field to THIS wine's colour, body, age and style. Return raw JSON only. No markdown. No explanation.`;
}

// "Wider market" (wine card Serve tab, when the cellar has nothing suitable):
// three wine STYLES to buy for before/after this wine, each justified and with
// a typical retail price range. Styles, not invented bottles.
function buildMarketPrompt(w: { producer?: string; wineName?: string; region?: string; vintage?: string; grape?: string }, slot: 'before' | 'after', suggested: string, currency: string): string {
  const identity = [w.producer, w.wineName, w.vintage].filter(Boolean).join(' ') + (w.region ? `, ${w.region}` : '');
  return `You are a world-class sommelier. The user is opening ${identity} and wants something to drink ${slot === 'before' ? 'BEFORE it (an aperitif / opener)' : 'AFTER it (to follow it or finish the evening)'}. Vinster suggested: "${suggested}". They have nothing suitable in their cellar, so suggest three wine STYLES they could buy.

Return ONLY valid JSON:
{
  "styles": [
    {
      "style": "a specific wine style / appellation, e.g. 'Crémant de Bourgogne Blanc de Blancs' or '10-Year-Old Tawny Port'",
      "reason": "2 short sentences: why this style works ${slot === 'before' ? 'before' : 'after'} THIS wine, and what to look for when buying",
      "priceRange": "typical retail price per bottle in ${currency}, e.g. '£18–£30'"
    }
  ]
}

Exactly three styles, best first, giving the user a real choice (different price points or characters). Styles only — do not name individual producers or bottles. Price ranges must be realistic for ${currency} retail today. Raw JSON only. No markdown.`;
}

// "Classic Pairing Ingredients" (Serve tab): up to six ingredients that pair
// classically with this wine — a mix of proteins, herbs & spices and vegetables.
function buildIngredientsPrompt(w: { producer?: string; wineName?: string; region?: string; vintage?: string; grape?: string; style?: string }): string {
  const identity = [w.producer, w.wineName, w.vintage].filter(Boolean).join(' ')
    + [w.region ? `, ${w.region}` : '', w.grape ? ` (${w.grape})` : '', w.style ? ` — ${w.style}` : ''].join('');
  return `You are a world-class sommelier and chef. List the classic pairing ingredients for this specific wine.

Wine: ${identity}

Return ONLY valid JSON:
{
  "ingredients": [
    { "name": "a single ingredient, e.g. 'Lamb', 'Rosemary', 'Porcini mushrooms'", "type": "protein" | "herb" | "vegetable" }
  ]
}

Exactly six ingredients, best first: two proteins, two herbs or spices, two vegetables (mushrooms count as vegetables). Single ingredients, not dishes. Tailor them to THIS wine's colour, body, age and style. Raw JSON only. No markdown.`;
}

Deno.serve(async (req) => {
  try {
    const limited = await checkRateLimit(req, 'wine-serving-suggestion', HOURLY_LIMIT, DAILY_LIMIT);
    if (limited) return limited;

    const body = await req.json();
    const { producer, wineName, region, vintage, grape, style, decantTime } = body;
    if (typeof producer !== 'string' && typeof wineName !== 'string') {
      return new Response(JSON.stringify({ error: 'wine identity required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (body.mode === 'ingredients') {
      const r = await client.messages.create({
        system: HOUSE_RULES,
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        messages: [{ role: 'user', content: buildIngredientsPrompt({ producer, wineName, region, vintage, grape, style }) }],
      });
      const t = r.content.find((b) => b.type === 'text')?.text ?? '';
      const m = t.match(/\{[\s\S]*\}/);
      const parsed = m ? JSON.parse(m[0]) : null;
      const types = new Set(['protein', 'herb', 'vegetable']);
      const ingredients = Array.isArray(parsed?.ingredients)
        ? parsed.ingredients
            .filter((x: any) => typeof x?.name === 'string' && x.name.trim())
            .map((x: any) => ({ name: String(x.name).trim().slice(0, 40), type: types.has(x.type) ? x.type : 'vegetable' }))
            .slice(0, 6)
        : [];
      return new Response(JSON.stringify({ ingredients }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (body.mode === 'market') {
      const slot = body.slot === 'after' ? 'after' : 'before';
      const suggested = String(body.suggested ?? '').slice(0, 200);
      const currency = String(body.currency ?? 'GBP').slice(0, 3).toUpperCase();
      const r = await client.messages.create({
        system: HOUSE_RULES,
        model: 'claude-sonnet-5-5',
        max_tokens: 1500,
        messages: [{ role: 'user', content: buildMarketPrompt({ producer, wineName, region, vintage, grape }, slot, suggested, currency) }],
      });
      const t = r.content.find((b) => b.type === 'text')?.text ?? '';
      const m = t.match(/\{[\s\S]*\}/);
      const parsed = m ? JSON.parse(m[0]) : null;
      const styles = Array.isArray(parsed?.styles) ? parsed.styles.filter((x: any) => x?.style && !/prosecco/i.test(JSON.stringify(x))).slice(0, 3) : [];
      return new Response(JSON.stringify({ styles }), { headers: { 'Content-Type': 'application/json' } });
    }

    const response = await client.messages.create({
      system: HOUSE_RULES,
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{ role: 'user', content: buildPrompt({ producer, wineName, region, vintage, grape, style, decantTime: typeof decantTime === "string" ? decantTime.slice(0, 200) : undefined }) }],
    });

    const text = response.content.find((b) => b.type === 'text')?.text ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`No JSON found: ${text.slice(0, 200)}`);
    const parsed = JSON.parse(match[0]);
    return new Response(JSON.stringify(parsed), { headers: { 'Content-Type': 'application/json' } });
  } catch (_err) {
    return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
