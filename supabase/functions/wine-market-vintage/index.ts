import Anthropic from 'npm:@anthropic-ai/sdk';
import { checkRateLimit } from '../_shared/rateLimit.ts';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

const HOURLY_LIMIT = 90;
const DAILY_LIMIT = 400;

// Generate "Vinster's Market & Vintage Comparison" on demand for a cellar wine:
// how this VINTAGE compares to the wine's other vintages (quality/style of the
// year), and where its MARKET value sits (trajectory, relative value). Grounded
// in general knowledge — framed honestly as guidance, not a live quote.
function buildPrompt(w: { producer?: string; wineName?: string; region?: string; vintage?: string; grape?: string; currency?: string }): string {
  const identity = [w.producer, w.wineName, w.vintage].filter(Boolean).join(' ')
    + [w.region ? `, ${w.region}` : '', w.grape ? ` (${w.grape})` : ''].join('');
  return `You are a world-class wine-market analyst and sommelier. For the specific wine below, give a concise Market & Vintage Comparison.

Wine: ${identity}
Currency for any value framing: ${w.currency ?? 'GBP'}

Return ONLY valid JSON with this structure:
{
  "vintage": "2-3 sentences on how the ${w.vintage ?? 'stated'} vintage compares to this wine's other vintages — the character and quality of the year for this wine/region, whether it's a stronger or weaker year, and how it's drinking relative to neighbouring vintages.",
  "market": "2-3 sentences on where this wine's market value sits — its price trajectory (rising / stable / softening), how it compares in value to peers, and whether it's one to hold or drink. Frame figures as guidance, not a live quote."
}

Be specific to this producer, wine and vintage. If the vintage is NV or unknown, focus the "vintage" field on the wine's typical style and consistency instead. Return raw JSON only. No markdown. No explanation.`;
}

Deno.serve(async (req) => {
  try {
    const limited = await checkRateLimit(req, 'wine-market-vintage', HOURLY_LIMIT, DAILY_LIMIT);
    if (limited) return limited;

    const { producer, wineName, region, vintage, grape, currency } = await req.json();
    if (typeof producer !== 'string' && typeof wineName !== 'string') {
      return new Response(JSON.stringify({ error: 'wine identity required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-5-5',
      thinking: { type: 'between_tools' },
      max_tokens: 4000,
      messages: [{ role: 'user', content: buildPrompt({ producer, wineName, region, vintage, grape, currency }) }],
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
