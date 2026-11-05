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

RECOGNITION GATE — set "identified" to true ONLY if you genuinely know this producer AND this specific wine (the names may be misheard, misread or not a real wine). If identified is false, return exactly {"identified": false, "vintage": null, "market": null} — never describe a wine's vintages, value, trajectory or peers as if you know it when you don't, and never substitute a similar wine you do know.

Return ONLY valid JSON with this structure:
{
  "identified": <true|false — see RECOGNITION GATE above>,
  "vintage": "2-3 sentences on how the ${w.vintage ?? 'stated'} vintage compares to this wine's other vintages — the character and quality of the year for this wine/region, whether it's a stronger or weaker year, and how it's drinking relative to neighbouring vintages.",
  "market": "2-3 sentences on where this wine's market value sits — its price trajectory (rising / stable / softening), how it compares in value to peers, and whether it's one to hold or drink. Frame figures as guidance, not a live quote."
}

Be specific to this producer, wine and vintage. If the vintage is NV or unknown, focus the "vintage" field on the wine's typical style and consistency instead. Return raw JSON only. No markdown. No explanation.`;
}

// Rarity (wine card Market tab): how hard this wine is to find — production
// size, how stocks are holding up for this vintage, scarce formats. Same
// recognition gate: never judge a wine it doesn't genuinely know.
function buildRarityPrompt(w: { producer?: string; wineName?: string; region?: string; vintage?: string; grape?: string }): string {
  const identity = [w.producer, w.wineName, w.vintage].filter(Boolean).join(' ')
    + [w.region ? `, ${w.region}` : '', w.grape ? ` (${w.grape})` : ''].join('');
  return `You are a fine-wine market expert. Assess how RARE this specific wine is to find and buy today.

Wine: ${identity}

RECOGNITION GATE — set "identified" to true ONLY if you genuinely know this producer AND this specific wine. If not, return exactly {"identified": false, "level": null, "label": null, "text": null}. Never guess production figures for a wine you don't know, and never substitute a similar wine.

Return ONLY valid JSON:
{
  "identified": <true|false>,
  "level": <1-5: 1 = widely available, 2 = easy to find, 3 = uncommon, 4 = scarce, 5 = very rare / allocation only>,
  "label": "<one of: Widely available | Easy to find | Uncommon | Scarce | Very rare>",
  "text": "2 short sentences: roughly how much is made (use approximate, hedged figures you are confident of, e.g. 'a few thousand cases'), how stocks of the ${w.vintage ?? 'stated'} vintage are holding up now, and any formats that are harder to find."
}

Raw JSON only. No markdown.`;
}

// When the wine name is blank or just repeats the producer ("Il Marroneto" /
// "Il Marroneto"), it's the producer's appellation wine — borrow the
// appellation from an "Appellation, Region, Country" region so the model
// recognises it ("Il Marroneto Brunello di Montalcino"). Mirrors the app's
// lookupWineName (older builds send the bare name).
const fold = (s: unknown) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
function lookupWineName(producer: unknown, wineName: unknown, region: unknown): string {
  const n = String(wineName ?? '').trim();
  if ((n && fold(n) !== fold(producer)) || typeof region !== 'string') return n;
  const parts = region.split(',').map((x) => x.trim()).filter(Boolean);
  if (parts.length < 3 || fold(producer).includes(fold(parts[0]))) return n;
  return parts[0];
}

Deno.serve(async (req) => {
  try {
    const limited = await checkRateLimit(req, 'wine-market-vintage', HOURLY_LIMIT, DAILY_LIMIT);
    if (limited) return limited;

    const body = await req.json();
    const { producer, region, vintage, grape, currency, mode } = body;
    const wineName = lookupWineName(producer, body.wineName, region);
    if (typeof producer !== 'string' && typeof body.wineName !== 'string') {
      return new Response(JSON.stringify({ error: 'wine identity required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (mode === 'rarity') {
      const r = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [{ role: 'user', content: buildRarityPrompt({ producer, wineName, region, vintage, grape }) }],
      });
      const t = r.content.find((b) => b.type === 'text')?.text ?? '';
      const m = t.match(/\{[\s\S]*\}/);
      const parsed = m ? JSON.parse(m[0]) : null;
      const level = Number(parsed?.level);
      const ok = parsed?.identified === true && Number.isFinite(level) && level >= 1 && level <= 5 && typeof parsed?.text === 'string';
      return new Response(JSON.stringify(ok
        ? { identified: true, level: Math.round(level), label: String(parsed.label ?? ''), text: String(parsed.text) }
        : { identified: false, level: null, label: null, text: null }), { headers: { 'Content-Type': 'application/json' } });
    }

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{ role: 'user', content: buildPrompt({ producer, wineName, region, vintage, grape, currency }) }],
    });

    const text = response.content.find((b) => b.type === 'text')?.text ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`No JSON found: ${text.slice(0, 200)}`);
    const parsed = JSON.parse(match[0]);
    // Enforce the recognition gate: anything but an explicit identified:true
    // ships nulls, never invented vintage/market commentary.
    if (parsed?.identified !== true) {
      return new Response(JSON.stringify({ identified: false, vintage: null, market: null }), { headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify(parsed), { headers: { 'Content-Type': 'application/json' } });
  } catch (_err) {
    return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
