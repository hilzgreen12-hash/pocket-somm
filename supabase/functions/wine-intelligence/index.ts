import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

Deno.serve(async (req) => {
  try {
    const { producer, region, wineName, vintage, style, colour, currency, wsScore } = await req.json();
    // Optional Wine-Searcher aggregated critic score (0–100). When present it
    // becomes the "north star" anchor for criticScore — the Vinster score is
    // grounded in real market data but Claude may nudge it with good reason.
    const wsScoreNum: number | null =
      typeof wsScore === 'number' && Number.isFinite(wsScore) ? Math.round(wsScore) : null;
    // Accept either `style` (new) or `colour` (legacy clients still in flight)
    const styleValue: string | null = (typeof style === 'string' && style.trim())
      ? style.trim()
      : (typeof colour === 'string' && colour.trim() ? colour.trim() : null);

    const vintageStr = vintage === 'NV' ? 'Non-Vintage' : vintage;
    const wineNameStr = wineName ? `\n- Wine Name: ${wineName}` : '';
    const styleStr = styleValue ? `\n- Style: ${styleValue} (confirmed by user — use this to disambiguate if producer makes multiple wines of this name)` : '';
    const wsScoreStr = wsScoreNum != null ? `\n- Wine-Searcher aggregated critic score: ${wsScoreNum}/100` : '';
    const currentYear = new Date().getFullYear();
    const cur = (currency ?? 'GBP').toString().toUpperCase();

    // When Wine-Searcher gives us a real aggregated score, anchor the Vinster
    // criticScore to it (the user's "north star" model) rather than letting
    // Claude estimate from scratch.
    const scoreGuidance = wsScoreNum != null
      ? `\n\nIMPORTANT — criticScore anchoring: Wine-Searcher's aggregated critic score for this exact wine is ${wsScoreNum}/100. Use this as your PRIMARY anchor ("north star") for the "criticScore" field. Default to returning ${wsScoreNum} unchanged. Only adjust it when you have a specific, well-founded reason (e.g. you confidently recall major published critic scores that materially shift the consensus), and even then keep it within a few points of ${wsScoreNum} and reflect that reasoning in criticScores. The result is a Vinster score grounded in real market data. Never set criticScore to null when this anchor is provided.`
      : '';

    const prompt = `You are a wine expert with encyclopaedic knowledge of wines, producers, vintages, and critic scores.

Provide intelligence on this wine:
- Producer: ${producer}
- Region: ${region}${wineNameStr}
- Vintage: ${vintageStr}${styleStr}${wsScoreStr}

Return ONLY a valid JSON object with exactly this structure:
{
  "criticScore": <integer 0-100 — the AVERAGE / consensus critic score for this exact wine and vintage. ALWAYS provide your best expert estimate of where critics would rate this wine, informed by the producer's reputation, the wine's quality tier, the region and the vintage. This is Vinster's estimated consensus — NOT a claim that a specific review exists (the criticScores array below carries any real published scores). For ANY wine with a recognisable producer or region, estimate a score rather than returning null. Return null ONLY in the rare case you genuinely cannot identify the wine at all. When you list individual scores in criticScores, this should be roughly their average (convert any /20 scores to /100 first)>,
  "criticScoreNote": <single short sentence — 20 words max — used ONLY in the rare case criticScore is null, explaining why the wine could not be identified/scored. e.g. "Couldn't confidently identify this wine, so no reliable score estimate." Do NOT assert the producer's size/scale (e.g. "small producer") unless you are genuinely certain of it. Set to null whenever criticScore is provided>,
  "criticScores": <array of individual PUBLISHED critic scores for this EXACT wine and vintage that you genuinely recall as real. Each item: {"critic": <short abbreviation>, "score": <number on that critic's own scale>, "scale": <"100" for most critics; "20" for Jancis Robinson>}. Use these standard abbreviations only: "JS" (James Suckling), "JR" (Jancis Robinson, /20), "NM" (Neal Martin), "WK" (William Kelly), "AG" (Antonio Galloni), "WA" (Wine Advocate), "WS" (Wine Spectator), "WE" (Wine Enthusiast), "D" (Decanter), "V" (Vinous), "JD" (Jeb Dunnuck), "BH" (Burghound). CRITICAL: include ONLY scores you are genuinely confident were actually published for this precise wine+vintage — never invent, guess, or approximate a plausible-looking number. Return an empty array [] if you do not confidently recall any specific published scores. Maximum 6 entries>,
  "drinkingWindowFrom": <4-digit year when ready to drink, or null>,
  "drinkingWindowTo": <4-digit year by which it should ideally be drunk, or null>,
  "drinkingWindowStatus": <"too_young" | "approaching" | "peak" | "declining">,
  "grapeVariety": <primary grape variety or blend, e.g. "Pinot Noir" or "Grenache/Syrah/Mourvèdre">,
  "tastingNotes": <2-3 sentences describing the wine's character in an elegant sommelier style>,
  "estimatedValue": <integer single best per-bottle retail estimate in ${cur} from typical independent merchants in the relevant market, or null. Return null READILY — whenever the wine is rare, obscure, from a small or low-distribution producer, or you are not genuinely confident of its current market price. A wrong number is far worse than null, so when in doubt return null rather than guessing. Account for vintage scarcity, producer reputation, and current market trends. Return the number only — no currency symbol, no decimals>,
  "estimatedValueLow": <integer low end of a plausible per-bottle price range in ${cur}, or null. Set this together with estimatedValueHigh whenever you provide an estimatedValue>,
  "estimatedValueHigh": <integer high end of the plausible per-bottle price range in ${cur}, or null>,
  "valueConfidence": <"high" | "medium" | "low" reflecting how confident you are in estimatedValue, or null when estimatedValue is null. Use "high" ONLY for widely-traded wines with well-established, stable pricing; "medium" when you have a reasonable sense but limited data; "low" when you are estimating from sparse knowledge>
}

Always estimate a drinking window (from/to years) and a status from the vintage, grape and region — never return "unknown". Base the status on the current year ${currentYear} relative to the from/to years.

Be conservative and honest with valuation: it is better to return null for estimatedValue (and valueConfidence) than to publish a confident-looking but wrong price. Only mark "high" confidence for wines you genuinely know trade actively at an established price.

PRODUCER-SCALE DISCIPLINE: in tastingNotes and criticScoreNote, only describe the producer's size or production scale (e.g. "small artisanal grower", "boutique estate", "large négociant") when you are genuinely certain it is accurate. Many well-known estates are mistaken for small producers — when unsure of scale, describe the wine's character, reputation or style WITHOUT making a size claim. Never guess production scale.${scoreGuidance}

Return only the raw JSON — no markdown, no explanation.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const match = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim().match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`No JSON found: ${text.slice(0, 200)}`);

    // Parse-then-restringify so the response is guaranteed to be valid JSON.
    // The previous form called JSON.parse only as a truthiness guard and sent
    // back the raw match[0] string — if Claude's output was truncated by
    // max_tokens the parse threw and the outer catch returned a generic 500
    // that surfaced to users as "Could not refresh / wine-intelligence: …".
    const parsed = JSON.parse(match[0]);
    if (!parsed) {
      return new Response(JSON.stringify({ error: 'empty' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('wine-intelligence error:', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
