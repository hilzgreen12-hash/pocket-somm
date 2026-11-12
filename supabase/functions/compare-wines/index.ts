import Anthropic from 'npm:@anthropic-ai/sdk';
import { checkRateLimit } from '../_shared/rateLimit.ts';

// Compare Wines or Vintages (Home → Search & Discover). Two to four wines the
// user picked (catalogue search or a label scan), each with its Wine-Searcher
// score and price when found. Returns Vinster's side-by-side comparison:
// per-wine critic score, drinking window, critical reception and a vintage
// report (and region + grape when the wines differ), then which to drink now,
// which to lay down, best value, the market comparison and an Inside Line on
// the nuances between them.
//
// mode 'vintages' = the same wine in different vintages; 'wines' = different
// wines (adds a region and grape comparison).

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

const HOURLY_LIMIT = 20;
const DAILY_LIMIT = 60;

interface InWine {
  producer?: string; wineName?: string | null; region?: string | null; grape?: string | null;
  vintage?: string | null; wsScore?: number | null; wsPrice?: number | null;
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
}

function describe(w: InWine, i: number, currency: string): string {
  const name = [w.producer, w.wineName].filter(Boolean).join(' ');
  const bits = [
    `Wine ${i + 1}: ${name} ${w.vintage || 'NV'}`,
    w.region ? `region: ${w.region}` : null,
    w.grape ? `grape: ${w.grape}` : null,
    w.wsScore != null ? `Wine-Searcher aggregate critic score: ${w.wsScore}/100` : 'Wine-Searcher critic score: not found',
    w.wsPrice != null ? `Wine-Searcher average market price: ${Math.round(w.wsPrice)} ${currency}` : 'Wine-Searcher market price: not found',
  ].filter(Boolean);
  return bits.join(' · ');
}

function buildPrompt(wines: InWine[], mode: 'vintages' | 'wines', currency: string): string {
  const year = new Date().getFullYear();
  const list = wines.map((w, i) => describe(w, i, currency)).join('\n');
  const winesMode = mode === 'wines';
  return `You are Vinster, a world-class sommelier and fine-wine market analyst. The user wants to compare ${winesMode ? 'these different wines' : 'these vintages of the same wine'} in detail. The current year is ${year}. Currency: ${currency}.

${list}

RECOGNITION GATE (per wine) — set "identified" true ONLY if you genuinely know this producer AND this specific wine. Names may be misread from a label photo. If a wine is not identified, set every other field for that wine to null and never describe it as if you know it, and never substitute a similar wine you do know. Leave unidentified wines out of drinkNow / layDown / bestValue.

SCORES — where a Wine-Searcher score is given, use it as the criticScore unless you have a specific, well-founded reason to adjust it by a few points. Otherwise estimate the consensus critic score for that exact wine and vintage.

REVIEWS — summarise how critics have received this wine and vintage in your own words. NEVER invent a quote, and never attribute a score or remark to a named critic or publication unless you genuinely recall it was published.

Return ONLY valid JSON, no markdown:
{
  "wines": [ one object per wine, in the order given:
    {
      "identified": <true|false>,
      "criticScore": <integer 0-100 or null>,
      "drinkingWindowFrom": <year or null>,
      "drinkingWindowTo": <year or null>,
      "drinkingWindowStatus": <"too_young" | "approaching" | "peak" | "declining" | null>,
      "estimatedValue": <number in ${currency}: ONLY when no Wine-Searcher price was given, your best estimate of current market value; otherwise null>,
      "reviews": "2-3 sentences: the critical reception of this wine and vintage.",
      "vintageReport": "3-4 sentences: a detailed report on this vintage in this region — the growing season and harvest conditions — and how it compares with the wine's other recent vintages.",
      "styleImpact": "2 sentences: how the vintage shapes this wine's style — fruit, structure, acidity, tannin, alcohol, ageing potential."${winesMode ? `,
      "regionNote": "2 sentences: this wine's region or appellation and what it brings to the glass.",
      "grapeNote": "1-2 sentences: the grape variety or blend and its contribution."` : ''}
    }
  ],
  "drinkNow": { "wine": <1-based wine number best to drink now, or null>, "reason": "1-2 sentences" },
  "layDown": { "wine": <1-based wine number best to lay down, or null if none should be kept>, "reason": "1-2 sentences" },
  "bestValue": { "wine": <1-based wine number offering the best value, or null>, "reason": "1 sentence" },
  "marketComparison": "2-3 sentences comparing the market prices and value across the selection${winesMode ? '' : ' and how the market rates these vintages against each other'}.",${winesMode ? `
  "regionGrapeComparison": "3-4 sentences contrasting the regions and grape varieties of these wines — climate, soils, style — and what that means side by side.",` : ''}
  "insideLine": "2-4 sentences: Vinster's Inside Line — the nuances between these ${winesMode ? 'wines' : 'vintages'} that the scores alone don't show (e.g. a lighter year drinking more charmingly now, a hidden-gem vintage, a style shift, a winemaking change, bottle variation, a vintage the market undervalues).",
  "verdict": "2 sentences: Vinster's overall verdict on the selection."
}

Be specific to these producers, wines and vintages. Raw JSON only.`;
}

Deno.serve(async (req) => {
  if (!req.headers.get('Authorization')) return json({ error: 'Unauthorized' }, 401);
  try {
    const limited = await checkRateLimit(req, 'compare-wines', HOURLY_LIMIT, DAILY_LIMIT);
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const wines: InWine[] = Array.isArray(body.wines) ? body.wines.slice(0, 4) : [];
    const mode: 'vintages' | 'wines' = body.mode === 'vintages' ? 'vintages' : 'wines';
    const currency = typeof body.currency === 'string' && /^[A-Z]{3}$/.test(body.currency) ? body.currency : 'GBP';
    if (wines.length < 2 || wines.some((w) => !(w?.producer || w?.wineName))) {
      return json({ error: 'bad_input', message: 'Add at least two wines to compare.' }, 400);
    }

    let parsed: any = null;
    for (let attempt = 1; attempt <= 2 && !parsed; attempt++) {
      try {
        const response = await client.messages.create({
          model: 'claude-sonnet-5-5',
          max_tokens: 8000,
          messages: [{ role: 'user', content: buildPrompt(wines, mode, currency) }],
        });
        const block = response.content.find((b) => b.type === 'text');
        const text = block?.type === 'text' ? block.text : '';
        const match = text.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      } catch (err) {
        if (attempt === 2) throw err;
      }
    }
    if (!parsed || !Array.isArray(parsed.wines)) throw new Error('no comparison');

    // Keep one entry per input wine, in order, and drop picks that point at an
    // unidentified or missing wine.
    const out = wines.map((_, i) => parsed.wines[i] ?? { identified: false });
    const pick = (p: any) => {
      const n = Number(p?.wine);
      return Number.isInteger(n) && n >= 1 && n <= out.length && out[n - 1]?.identified ? { wine: n, reason: String(p.reason ?? '') } : null;
    };
    return json({
      mode,
      wines: out,
      drinkNow: pick(parsed.drinkNow),
      layDown: pick(parsed.layDown),
      bestValue: pick(parsed.bestValue),
      marketComparison: parsed.marketComparison ?? null,
      regionGrapeComparison: mode === 'wines' ? (parsed.regionGrapeComparison ?? null) : null,
      insideLine: parsed.insideLine ?? null,
      verdict: parsed.verdict ?? null,
    });
  } catch (err) {
    console.error('[compare-wines] error:', err instanceof Error ? err.message : String(err));
    return json({ error: 'failed', message: "Vinster couldn't compare these wines just now. Please try again." }, 500);
  }
});
