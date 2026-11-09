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

// Vinster's Verdict (Market tab): a considered judgement on THIS vintage, given
// the Wine-Searcher table. The ranks and best-value year are shown as points
// above it, so the verdict must not restate them — it weighs what the numbers
// can't: the vintage's age and drinking window (an older vintage at peak is
// worth more to drink now), scarcity, the year's character, and what to do.
function buildVerdictPrompt(b: any): string {
  const identity = [b.producer, b.wineName, b.vintage].filter(Boolean).join(' ') + (b.region ? `, ${b.region}` : '');
  const rows = (Array.isArray(b.rows) ? b.rows : []).slice(0, 20)
    .map((r: any) => `${r.vintage}: score ${r.score ?? '—'}, price ${r.price != null ? `${Math.round(r.price)} ${b.currency ?? ''}` : '—'}`).join('\n');
  // No vintage chosen (Home → Search a Wine → Compare Vintages): weigh the whole
  // range instead of one year.
  if (b.scope === 'range') {
    return `You are a world-class fine-wine merchant and sommelier writing Vinster's Verdict across the vintages of one wine.

Wine: ${identity}
This year: ${new Date().getFullYear()}
Rarity: ${b.rarity ?? 'unknown'}
Wine-Searcher market price and aggregate critic score by vintage:
${rows}

Already shown to the user as separate points (DO NOT restate these numbers): best-value vintage ${b.bestValueVintage ?? '?'} (lowest price per critic point).

Write a 3–5 sentence verdict that weighs what the table alone can't show:
- Where each part of the range sits in its drinking life: older vintages at or near their peak are ready to enjoy, and that drinkability adds real value which price per point doesn't capture; young vintages may need years before they show their worth.
- Scarcity: fewer bottles of older vintages remain, and rarity adds value the market price may not fully reflect.
- The character and reputation of the standout and weaker years for this wine.
- For young vintages, weigh the time and cost of storing them for many years (proper storage, tied-up money, risk) against buying an older vintage that's ready now.
- A clear recommendation: which vintage to buy to drink soon, which to buy to keep, and which to avoid or which aren't worth their premium.

Also pick, from the vintages IN THE TABLE ONLY, using the table's evidence and your own judgement of how each vintage is drinking:
- "drinkNow": up to 3 vintages best for drinking now (at or near peak, good quality for the money), with one short sentence why.
- "layDown": up to 3 vintages best to lay down (structured years that will reward cellaring and look good value for it), with one short sentence why that mentions roughly how long to wait.
Be specific to this wine. Never invent scores or prices not in the table. Plain prose, no headings, no bullet points.

Return ONLY JSON: {"verdict": "...", "drinkNow": {"vintages": [2010], "reason": "..."}, "layDown": {"vintages": [2019], "reason": "..."}}`;
  }
  const win = b.window && (b.window.from || b.window.to) ? `${b.window.from ?? '?'}–${b.window.to ?? '?'}${b.window.status ? ` (${b.window.status})` : ''}` : 'unknown';
  return `You are a world-class fine-wine merchant and sommelier writing Vinster's Verdict for one specific vintage.

Wine: ${identity}
This year: ${new Date().getFullYear()}
Drinking window for this vintage: ${win}
Rarity: ${b.rarity ?? 'unknown'}
Wine-Searcher market price and aggregate critic score by vintage:
${rows}

Already shown to the user as separate points (DO NOT restate these numbers or rankings): quality rank #${b.qualityRank ?? '?'} of ${b.total ?? '?'}, value rank #${b.valueRank ?? '?'} of ${b.total ?? '?'}, best-value vintage ${b.bestValueVintage ?? '?'}.

Write a 2–4 sentence verdict that weighs what the table alone can't show:
- The vintage's age and where it sits in its drinking window — an older vintage now at or near its peak is ready to enjoy, and that drinkability adds real value to the wine which may not be reflected in its price (price per point can make a mature vintage look poor value when it isn't); a young one may need years in the cellar before it shows its worth.
- Scarcity — fewer bottles of older vintages remain; rarity adds value that the market price may not fully capture.
- The character and reputation of this vintage for this wine.
- For a young vintage, weigh the time and cost of storing it for many years before it's ready (proper storage, tied-up money, risk) against buying an older vintage that's ready now.
- A clear recommendation: drink now, hold, buy more, or whether the premium (or discount) is justified.

Also pick, from the vintages IN THE TABLE ONLY, using the table's evidence and your own judgement of how each vintage is drinking:
- "drinkNow": up to 3 vintages that are best for drinking now (at or near peak, good quality for the money), with one short sentence why.
- "layDown": up to 3 vintages that are best to lay down (structured years that will reward cellaring and look good value for it), with one short sentence why that mentions roughly how long to wait.
Be specific to this wine and vintage. Never invent scores or prices not in the table. Plain prose, no headings, no bullet points.

Return ONLY JSON: {"verdict": "...", "drinkNow": {"vintages": [2010], "reason": "..."}, "layDown": {"vintages": [2019], "reason": "..."}}`;
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
  if (/^(chateau|clos|domaine|dom)\b/.test(fold(producer))) return n; // self-named estate = its own wine
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

    if (mode === 'verdict') {
      const r = await client.messages.create({
        model: 'claude-sonnet-5-5',
        // Sonnet 5.5 thinks first by default — leave room for the answer.
        max_tokens: 6000,
        messages: [{ role: 'user', content: buildVerdictPrompt({ ...body, producer, wineName, region, vintage }) }],
      });
      const t = r.content.find((x) => x.type === 'text')?.text ?? '';
      const m = t.match(/\{[\s\S]*\}/);
      const parsed = m ? JSON.parse(m[0]) : null;
      const verdict = String(parsed?.verdict ?? '').trim();
      // Keep only vintages actually in the table.
      const inTable = new Set((Array.isArray(body.rows) ? body.rows : []).map((x: any) => Number(x.vintage)));
      const pickOf = (p: any) => {
        const vintages = (Array.isArray(p?.vintages) ? p.vintages : []).map(Number).filter((v: number) => inTable.has(v)).slice(0, 3);
        return vintages.length ? { vintages, reason: String(p?.reason ?? '').trim() } : null;
      };
      return new Response(JSON.stringify({ verdict: verdict || null, drinkNow: pickOf(parsed?.drinkNow), layDown: pickOf(parsed?.layDown) }), { headers: { 'Content-Type': 'application/json' } });
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
