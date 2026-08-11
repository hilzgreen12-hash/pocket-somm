import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

Deno.serve(async (req) => {
  try {
    const { producer, region, wineName, vintage, style, colour, grape, currency, wsScore } = await req.json();
    // Optional Wine-Searcher aggregated critic score (0–100). When present it
    // becomes the "north star" anchor for criticScore — the Vinster score is
    // grounded in real market data but Claude may nudge it with good reason.
    const wsScoreNum: number | null =
      typeof wsScore === 'number' && Number.isFinite(wsScore) ? Math.round(wsScore) : null;
    // Accept either `style` (new) or `colour` (legacy clients still in flight)
    const styleValue: string | null = (typeof style === 'string' && style.trim())
      ? style.trim()
      : (typeof colour === 'string' && colour.trim() ? colour.trim() : null);

    const grapeValue: string | null = (typeof grape === 'string' && grape.trim()) ? grape.trim() : null;

    const vintageStr = vintage === 'NV' ? 'Non-Vintage' : vintage;
    const wineNameStr = wineName ? `\n- Wine Name: ${wineName}` : '';
    const styleStr = styleValue ? `\n- Style: ${styleValue} (confirmed by user — use this to disambiguate if producer makes multiple wines of this name)` : '';
    const grapeStr = grapeValue ? `\n- Grape: ${grapeValue} (confirmed — this pins which wine it is when the producer sells more than one under this name; treat the grape as known)` : '';
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
- Vintage: ${vintageStr}${styleStr}${grapeStr}${wsScoreStr}

Return ONLY a valid JSON object with exactly this structure:
{
  "criticScore": <integer 0-100 — the AVERAGE / consensus critic score for this exact wine and vintage. ALWAYS provide your best expert estimate of where critics would rate this wine, informed by the producer's reputation, the wine's quality tier, the region and the vintage. This is Vinster's estimated consensus — NOT a claim that a specific review exists (the criticScores array below carries any real published scores). For ANY wine with a recognisable producer or region, estimate a score rather than returning null. Return null ONLY in the rare case you genuinely cannot identify the wine at all. When you list individual scores in criticScores, this should be roughly their average (convert any /20 scores to /100 first)>,
  "criticScoreNote": <single short sentence — 20 words max — used ONLY in the rare case criticScore is null, explaining why the wine could not be identified/scored. e.g. "Couldn't confidently identify this wine, so no reliable score estimate." Do NOT assert the producer's size/scale (e.g. "small producer") unless you are genuinely certain of it. Set to null whenever criticScore is provided>,
  "criticScores": <array of individual PUBLISHED critic scores for this EXACT wine and vintage that you genuinely recall as real. Each item: {"critic": <short abbreviation>, "score": <number on that critic's own scale>, "scale": <"100" for most critics; "20" for Jancis Robinson>}. Use these standard abbreviations only: "JS" (James Suckling), "JR" (Jancis Robinson, /20), "NM" (Neal Martin), "WK" (William Kelly), "AG" (Antonio Galloni), "WA" (Wine Advocate), "WS" (Wine Spectator), "WE" (Wine Enthusiast), "D" (Decanter), "V" (Vinous), "JD" (Jeb Dunnuck), "BH" (Burghound). CRITICAL: include ONLY scores you are genuinely confident were actually published for this precise wine+vintage — never invent, guess, or approximate a plausible-looking number. Return an empty array [] if you do not confidently recall any specific published scores. Maximum 6 entries>,
  "drinkingWindowFrom": <4-digit year when ready to drink, or null>,
  "drinkingWindowTo": <4-digit year by which it should ideally be drunk, or null>,
  "drinkingWindowStatus": <"too_young" | "approaching" | "peak" | "declining">,
  "grapeVariety": <primary grape variety or blend, e.g. "Pinot Noir" or "Grenache/Syrah/Mourvèdre">,
  "grapeAmbiguous": <boolean. Set true ONLY when this EXACT producer + wine name is genuinely released as MORE THAN ONE distinct wine under the identical name, so the grape truly cannot be known from the name alone — e.g. a single-vineyard bottling sold as BOTH a red (Syrah) and a white (Chenin Blanc), or an appellation name like Hermitage that exists as both a red and a white under the same producer+name. This is FALSE for the overwhelming majority of wines: a wine with one grape/blend (even if the grape isn't printed on the label, like most Bordeaux, Burgundy, Rioja) is NOT ambiguous — you simply state its grape in grapeVariety. Also set FALSE whenever a Style or Grape was provided in the fields above (the user has already pinned which wine it is). When in doubt, false.>,
  "grapeOptions": <when grapeAmbiguous is true, an array of the distinct wines sharing this name, each {"grape": <variety>, "style": <"Red"|"White"|"Rosé"|"Sparkling"|"Fortified">}. Otherwise an empty array []. Maximum 4 entries — only real, distinct wines this producer makes under this exact name.>,
  "tastingNotes": <2-3 sentences describing the wine's character in an elegant sommelier style>,
  "insiderNote": <EXACTLY 2 sentences (3 only if genuinely needed), no more — tight and punchy. Genuine "in the know" insight about THIS producer and vintage — the kind of thing a sommelier friend tells you over the table, NOT a textbook definition. Focus on: how good this vintage actually was for this wine's region/style, and crucially HOW THIS PRODUCER OR WINE PERFORMED RELATIVE TO ITS PEERS that year (who excelled, who had an off year), plus any genuinely notable context (a declared vs undeclared year, a legendary or difficult vintage, a turning point for the estate). Be specific, confident and comparative where you truly know it — e.g. "1985 was a benchmark year for Vintage Port: Graham's and Fonseca declared and made age-worthy wines, while Taylor's was comparatively restrained that vintage." Do NOT repeat the tasting notes, drinking window or score. Do NOT hedge with generic filler ("a lovely wine from a good region"). If you genuinely lack specific vintage/producer knowledge, give the most specific REAL context you can; return null ONLY if you can say nothing specific and true>,
  "estimatedValue": <integer single best per-bottle retail estimate in ${cur} from typical independent merchants in the relevant market. ALWAYS provide your best estimate — never return null for any wine with a recognisable producer or region. When the wine is rare, obscure or from a small producer and you have little price data, still estimate from the producer's quality tier and reputation, the region and the vintage, and signal the uncertainty via valueConfidence:"low" (do NOT withhold a number). Account for vintage scarcity, producer reputation, and current market trends. Return null ONLY in the genuinely rare case you cannot identify the wine at all. Return the number only — no currency symbol, no decimals>,
  "estimatedValueLow": <integer low end of a plausible per-bottle price range in ${cur}, or null. Set this together with estimatedValueHigh whenever you provide an estimatedValue>,
  "estimatedValueHigh": <integer high end of the plausible per-bottle price range in ${cur}, or null>,
  "valueConfidence": <"high" | "medium" | "low" reflecting how confident you are in estimatedValue, or null when estimatedValue is null. Use "high" ONLY for widely-traded wines with well-established, stable pricing; "medium" when you have a reasonable sense but limited data; "low" when you are estimating from sparse knowledge>
}

Always estimate a drinking window (from/to years) and a status from the vintage, grape and region — never return "unknown". Base the status on the current year ${currentYear} relative to the from/to years.

Valuation rule: the user must ALWAYS see a price, so always provide a best-effort estimatedValue (with a plausible low/high range). Be honest about firmness via valueConfidence rather than by withholding the number — mark "high" ONLY for wines you genuinely know trade actively at an established price, "medium" for a reasonable sense, and "low" when estimating from sparse knowledge. Reserve a null estimatedValue for the rare wine you truly cannot identify at all.

PRODUCER-SCALE DISCIPLINE: in tastingNotes and criticScoreNote, only describe the producer's size or production scale (e.g. "small artisanal grower", "boutique estate", "large négociant") when you are genuinely certain it is accurate. Many well-known estates are mistaken for small producers — when unsure of scale, describe the wine's character, reputation or style WITHOUT making a size claim. Never guess production scale.

INSIDER NOTE — this is the "sommelier best friend" line, the payoff of the whole card, so make it earn its place. It must carry REAL, specific, comparative knowledge (this vintage vs other years, this producer vs its peers that year), never a generic platitude. Only assert a comparison you actually know to be true; when your specific knowledge is thin, narrow to what you genuinely know (the region's character in that year, the estate's general standing) rather than inventing a peer comparison. Accuracy over colour — but colour wherever you have the facts to back it. Keep it to 2 sentences (3 at the very most) — a sharp remark, not a paragraph.${scoreGuidance}

Return only the raw JSON — no markdown, no explanation.`;

    // Up to 2 attempts. Claude is non-deterministic, so an occasional response
    // that leads with a non-text block, wraps the JSON in prose/markdown, or gets
    // cut off — any of which fails the {…} match or JSON.parse — is usually clean
    // on a retry. Without this, a single bad generation threw straight to the
    // outer catch and surfaced to the user as a 500 "Something went wrong": the
    // intel card's intermittent failure. Mirrors the retry the recommend function
    // already uses. (find() the text block rather than assuming content[0].)
    async function attempt(): Promise<any> {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      });
      const textBlock = response.content.find((b) => b.type === 'text');
      const text = textBlock?.type === 'text' ? textBlock.text : '';
      const match = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim().match(/\{[\s\S]*\}/);
      if (!match) throw new Error(`No JSON found: ${text.slice(0, 200)}`);
      return JSON.parse(match[0]); // throws on truncated / invalid JSON
    }

    let parsed: any = null;
    let lastErr: unknown = null;
    for (let i = 1; i <= 2; i++) {
      try { parsed = await attempt(); break; }
      catch (e) {
        lastErr = e;
        console.error(`wine-intelligence attempt ${i} failed:`, e instanceof Error ? e.message : e);
      }
    }
    if (!parsed) throw lastErr ?? new Error('wine-intelligence: no result after retries');

    // Normalise the ambiguity signal so the client can gate on it safely.
    parsed.grapeAmbiguous = parsed.grapeAmbiguous === true;
    parsed.grapeOptions = (parsed.grapeAmbiguous && Array.isArray(parsed.grapeOptions))
      ? parsed.grapeOptions
          .map((o: any) => ({
            grape: typeof o?.grape === 'string' ? o.grape.trim() : '',
            style: typeof o?.style === 'string' && o.style.trim() ? o.style.trim() : null,
          }))
          .filter((o: any) => o.grape)
          .slice(0, 4)
      : [];
    // A pinned style or grape means the wine is already resolved; and fewer than
    // two real options isn't an actionable choice — treat both as unambiguous.
    if (styleValue || grapeValue || parsed.grapeOptions.length < 2) {
      parsed.grapeAmbiguous = false;
      parsed.grapeOptions = [];
    }

    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('wine-intelligence error:', message);
    // Logged above with full detail. The client gets a generic message:
    // raw exception text can carry Anthropic SDK request/response detail or
    // echo back model output on a JSON parse failure.
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
