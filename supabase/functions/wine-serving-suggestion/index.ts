import Anthropic from 'npm:@anthropic-ai/sdk';
import { checkRateLimit } from '../_shared/rateLimit.ts';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

const HOURLY_LIMIT = 90;
const DAILY_LIMIT = 400;

// Generate "how to serve THIS wine" on demand for a cellar wine card: serving
// temperature, decanting, glassware, plus a wine style to enjoy before (aperitif)
// and after (digestif). No dish context — this is about the wine itself.
function buildPrompt(w: { producer?: string; wineName?: string; region?: string; vintage?: string; grape?: string; style?: string }): string {
  const identity = [w.producer, w.wineName, w.vintage].filter(Boolean).join(' ')
    + [w.region ? `, ${w.region}` : '', w.grape ? ` (${w.grape})` : '', w.style ? ` — ${w.style}` : ''].join('');
  return `You are a world-class sommelier. Give concise, practical serving guidance for this specific wine.

Wine: ${identity}

Return ONLY valid JSON with this structure:
{
  "temperature": "ideal serving temperature, e.g. '16-18°C, slightly cool'",
  "decant": "whether to decant and for how long, e.g. 'Decant 45-60 min' or 'No need to decant'",
  "glassware": "the glass to use, e.g. 'Large Burgundy bowl' or 'Standard white-wine glass'",
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

Deno.serve(async (req) => {
  try {
    const limited = await checkRateLimit(req, 'wine-serving-suggestion', HOURLY_LIMIT, DAILY_LIMIT);
    if (limited) return limited;

    const { producer, wineName, region, vintage, grape, style } = await req.json();
    if (typeof producer !== 'string' && typeof wineName !== 'string') {
      return new Response(JSON.stringify({ error: 'wine identity required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{ role: 'user', content: buildPrompt({ producer, wineName, region, vintage, grape, style }) }],
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
