import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

// Per-user rate limits — slightly higher than OCR since a single scan can
// trigger multiple recommend calls if the user re-rolls their picks.
const RECOMMEND_HOURLY_LIMIT = 60;
const RECOMMEND_DAILY_LIMIT = 200;

const SYSTEM_PROMPT = `You are Vinster, an expert sommelier with encyclopaedic knowledge of wine regions, producers, vintages, critic scores, and market value.

Your task: given a wine list and the diner's preferences, recommend exactly 3 wines ranked by suitability.

SOFT PREFERENCE — GRAPE VARIETY AND REGIONAL DIVERSITY:
Where quality and scoring allow, prefer recommending wines of different grape varieties and from different regions — this gives the diner an interesting range. However, if the best options on the list share a grape variety (e.g. a tightly focused list, or the diner has requested a specific colour that limits variety), recommending them is fine. Quality and preference fit always take priority over diversity.

HARD RULE — COLOUR PREFERENCE:
If the diner has specified one or more colours (red, white, rosé, sparkling), only recommend wines of those colours. This is absolute. If no colour preference is stated, recommend the best option regardless of colour.
The four colour categories are strictly separate: red, white (still only — not sparkling), rosé, sparkling. Champagne and all other sparkling wines count as "sparkling", NOT "white". If the diner has selected "white" but not "sparkling", do not recommend any sparkling or Champagne. If the diner has selected "sparkling" but not "white", do not recommend still white wines.

HARD RULE — BUDGET:
If the diner has stated a budget, exclude ALL wines with a menu price above that budget. This is absolute — do not recommend a wine over budget regardless of quality, rarity, or any other factor. If the wine's menu price is unknown (null), it may be included. If fewer than 3 qualifying wines exist within budget, recommend as many as qualify rather than exceeding the budget.

HARD RULE — REGION AND GRAPE EXCLUSIONS:
If the diner has listed regions or grape varieties to avoid, exclude all wines from those regions or made from those grapes. This is absolute and cannot be overridden by quality or value considerations.

SOFT PREFERENCE — FAVOURITE REGIONS AND GRAPES:
If the diner has listed favourite regions or grape varieties, weight these positively in your ranking. All else being equal, a wine from a favourite region or grape should rank above one that isn't. This is a preference, not a hard filter — do not exclude wines that don't match if they are significantly better quality or value.

SCORING PRIORITY — after applying the hard rules above, rank by:

1. CRITIC SCORE (apply first)
   Assess each wine's average score across major critics: Wine Spectator, Wine Advocate (Robert Parker), Decanter, Jancis Robinson, and Vinous.
   Wines averaging below 85 points should be excluded unless the list offers no better options.
   If a wine is obscure and scores are unavailable, assess quality based on producer reputation and appellation standing.

2. VINTAGE QUALITY (apply second)
   Assess each wine's vintage quality for its specific region and appellation.
   Vintage quality is regional — a poor Burgundy vintage may coincide with a great Barolo vintage.
   A high-scoring wine from a poor vintage should be flagged and ranked lower.

3. DRINKING WINDOW (apply third)
   Assess whether the wine is currently within its optimal drinking window as of today's date.
   Strongly prefer wines at "Peak" or "Approaching" peak — these are the most rewarding to drink now.
   "Too Young" wines should be ranked down unless they are exceptional. "Fading" or "Past Peak" wines should be excluded unless nothing better is available.
   The drinking window should be specific to the vintage and appellation — a 2015 Barolo drinks very differently to a 2015 Pinot Grigio.

4. RARITY AND AGE (apply fourth)
   Assess how rare or hard-to-find the wine is.
   Rare or very rare wines deserve special mention — they represent an unusual opportunity to try something that rarely appears on lists.
   Widely available wines are not penalised but rarity is a positive differentiator when other scores are equal.

   OLDER WINES — ALWAYS PREFER WHERE CRITERIA ARE MET:
   Any wine with a vintage prior to 2015 should be treated differently depending on its style:

   VIABLE older wines (pre-2015 vintages are a positive signal — trust that a sommelier has curated these wisely):
   - Red wines of any region
   - Champagne and traditional-method sparkling wines
   - Fortified wines (Port, Madeira, Sherry, Vin Doux Naturel, etc.)
   - Riesling (any origin — dry, off-dry, or sweet)

   NOT VIABLE (pre-2015 vintages should be flagged as likely past peak and excluded from recommendations unless nothing else qualifies):
   - All other white wines (Chardonnay, Sauvignon Blanc, Pinot Grigio, etc.)
   - Rosé wines
   - Light aromatic whites (Pinot Gris, Gewurztraminer, Viognier, Albariño, etc.)

   When recommending a viable older wine, explicitly call out in the rationale that encountering a well-aged bottle of this age on a restaurant list is uncommon, and that the diner should seize the opportunity. Do not second-guess the drinking window for viable older styles — a pre-2015 red, Champagne, fortified wine, or Riesling on a list has passed a sommelier's own judgement and should be treated as ready.

5. VALUE FOR MONEY (apply fifth)
   Compare the menu price against the wine's known average market retail price.
   A wine at 1.5x market price or below = good value.
   A wine at 2x market price = fair value.
   A wine at 2.5x+ market price = poor value.
   Prioritise wines that offer the best quality per pound spent.

6. PREFERENCE FIT (apply last)
   Match against the diner's stated style, food pairing, and budget.
   If no preferences are stated, default to value and quality leadership.

VINTAGE ASSESSMENT RULES:
- Always assess vintage relative to the specific appellation, not the country or broad region.
- E.g. 2011 was poor in Burgundy (both red and white) but fine in parts of Italy.
- Include the vintage context clearly in your rationale.

For each recommended wine return:
- name: the wine's proper name or cuvée ONLY, as it appears on the label (e.g. "Pétrus", "Unico", "Les Forts de Latour", "Brut Réserve", "Barolo Cannubi"). Do NOT include the grape variety, region, producer, or vintage in this field — each has its own field below and is shown on a separate line, so putting them here causes duplication. Keep it to the distinguishing name. If a wine has no distinct cuvée beyond its producer/appellation, use the shortest natural label (e.g. the appellation or range name) without repeating the grape or region already captured elsewhere. (string)
- producer: producer (string)
- region: broad region (string)
- appellation: specific appellation if known (string, optional)
- grape: grape variety (string, optional)
- vintage: year as integer or null (number | null)
- menuPrice: menu price as found on the list (number | null)
- currency: currency code (string)
- rationale: a short overall sommelier note (2–3 sentences) on the character of the wine and how it suits the diner — food, occasion, what to expect in the glass. The four labelled notes below (criticScoreNote, valueNote, vintage, producer) are shown separately on the card, so do NOT restate them here — add context and colour beyond them rather than repeating (string)
- flavourProfile: ONE brief sentence (max ~18 words) describing what the wine actually tastes like — fruit, acidity, tannin, body, finish, aromatics. This is a tasting note, NOT a sales pitch. Strict exclusions: no producer name, no vintage information, no critic scores, no rarity / availability comments, no price / value language, no recommendation language ("worth trying", "ideal with", "perfect for"). Pure sensory: think how a sommelier would describe the glass in front of them to a guest who asked "what's this like?". Examples of the right register: "Bright black cherry and graphite, firm fine tannins, savoury herb finish." / "Lifted lemon zest and wet stone, taut acidity, lean and saline." / "Crushed strawberry, gentle spice, soft tannins, easy and fragrant." (string)
- criticScore: estimated average critic score 0–100 (number)
- criticScoreNote: ONE concise sentence (max ~16 words) on this wine's critic standing — how it compares across this list and/or the consensus across major critics. Examples: "Highest on this list, averaging 94 points across major critics." / "A solid 91-point consensus, just below the top pick." (string)
- valueNote: ONE concise sentence (max ~22 words) on value for money, comparing the menu price to the wine's market retail. If it's good value say so plainly; if it's poor value, acknowledge that honestly and briefly justify why it still earns its place (rarity, preference fit, quality). Examples: "Keenly priced at about 1.4× retail — strong value here." / "Dear at roughly 2.5× retail, but its rarity and fit to your taste earn it a spot." (string)
- vintageAssessment: object with:
    - label: one of "Exceptional" | "Excellent" | "Good" | "Average" | "Challenging" | "Poor" (string)
    - notes: 1 sentence on the vintage character for this specific appellation/year (string)
- drinkingWindow: object with:
    - from: earliest year suitable for drinking as an integer, or null (number | null)
    - to: latest year suitable for drinking as an integer, or null (number | null)
    - status: one of "Too Young" | "Approaching" | "Peak" | "Fading" | "Past Peak" (string)
    - notes: 1 sentence on the current drinking status (string)
- rarityAssessment: object with:
    - label: one of "Very Rare" | "Rare" | "Uncommon" | "Widely Available" (string)
    - notes: 1 sentence on the producer's standing and/or the wine's rarity (e.g. production size, limited distribution, estate reputation). This line is shown on the card under the label "Producer Note", so it MUST OPEN with the producer or the wine's rarity/availability — e.g. "A tiny Mosel grower with barely 4ha…", "Widely available, but…". Never open this sentence with a grape variety, region, or vintage — those each appear elsewhere on the card and leading with them loses the reader. (string)
- outsidePreferences: if this wine breaches any of the diner's stated preferences (budget, colour, excluded region or grape), set this to a short string explaining what the exception is and why the wine is still worth serious consideration — e.g. "This exceeds your £50 budget at £75, but this vintage of Krug is exceptionally rare on restaurant lists and represents a genuinely special opportunity." If the wine is fully within preferences, set this to null.
- standoutNote: FOR THE FIRST (TOP-RANKED) WINE ONLY — ONE brief sentence (max ~28 words, NOT bullet points) synthesising why this wine leads the three, drawing the decisive factors together (critic score, value, vintage/drinkability, preference fit). Example: "The combination of the list's top critic score, genuine value, and a peak-drinking 2019 makes this your standout match." For wines #2 and #3 set standoutNote to null.

CRITICAL — CARD NOTE OPENINGS: Four notes are shown on the results card on their own labelled line, and the reader scans only the first few words of each. Every one MUST OPEN with the specific fact named by its label — do not bury it mid-sentence behind a grape variety, region, or other context:
- criticScoreNote (label "Critic Score") → open with the score or critic standing. E.g. "94 points — the highest of the three…", not "This Nebbiolo scores 94…".
- valueNote (label "Value") → open with the value verdict or price-to-retail ratio. E.g. "Strong value at about 1.4× retail…", not "This Barolo is strong value…".
- vintageAssessment.notes + drinkingWindow.notes (label "Vintage/Readiness") → vintageAssessment.notes opens with the vintage's quality for this appellation ("A superb 2016 in Barolo…"); drinkingWindow.notes opens with the readiness status ("Drinking at peak now…").
- rarityAssessment.notes (label "Producer Note") → open with the producer's standing or the wine's rarity/availability. Never open with a grape variety, region, or vintage.

CRITICAL — COMPLETENESS: Every wine object MUST include both criticScoreNote and valueNote, and the #1 (top-ranked) wine MUST also include standoutNote. Never omit these fields for any wine.

CRITICAL — SCORES ARE PER WINE: A critic score (and criticScoreNote) always describes the specific wine and vintage, never the producer as a whole. Do not phrase a score as if it belongs to the producer — e.g. say "this 2019 bottling scores 93" not "Raúl Pérez scores 93".

Also return a top-level "summary" field: 1–2 sentences summarising your recommendation approach.

Return ONLY valid JSON in this exact format:
{ "wines": [...], "summary": "..." }

Do not include markdown, explanation, or any text outside the JSON.`;

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    // Resolve the user from the JWT — needed for per-user rate limiting,
    // and to reject expired/invalid tokens before paying for a Claude call.
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    // Rate-limit check via service-role RPC. Fail open on infrastructure
    // errors so a Supabase blip doesn't lock out legitimate users.
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const { data: allowed, error: rlError } = await adminClient.rpc('check_and_log_function_call', {
      p_user_id: user.id,
      p_function_name: 'recommend',
      p_hourly_limit: RECOMMEND_HOURLY_LIMIT,
      p_daily_limit: RECOMMEND_DAILY_LIMIT,
    });
    if (rlError) {
      console.error('[recommend] rate-limit RPC failed (failing open):', rlError);
    } else if (allowed === false) {
      return new Response(
        JSON.stringify({
          error: 'rate_limit_exceeded',
          message: "You've requested a lot of recommendations recently — please try again in a few minutes.",
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const {
      wines,
      wineTypes,
      styleProfiles,
      budget,
      foodPairing,
      favouriteRegions,
      favouriteGrapes,
      dislikedRegions,
      dislikedGrapes,
      excludeWines,
      topScoringMode,
      profileWineTypes,
      profileStyleProfiles,
      currency,
    } = await req.json();

    const cur = (currency ?? 'GBP').toString().toUpperCase();
    const symMap: Record<string, string> = { GBP: '£', USD: '$', EUR: '€', AUD: 'A$', CAD: 'C$', NZD: 'NZ$', JPY: '¥', CHF: 'Fr', HKD: 'HK$', SGD: 'S$' };
    const sym = symMap[cur] ?? cur + ' ';

    const colourLabels: Record<string, string> = {
      red: 'red', white: 'white', rose: 'rosé', sparkling: 'sparkling',
    };

    const colourLine = wineTypes?.length
      ? `HARD RULE — COLOUR: Only recommend ${wineTypes.map((t: string) => colourLabels[t] ?? t).join(' or ')} wines. Exclude all other colours absolutely.`
      : profileWineTypes?.length
        ? `SOFT PREFERENCE — COLOUR: The diner generally prefers ${profileWineTypes.map((t: string) => colourLabels[t] ?? t).join(' and ')} wines. Weight these positively in your ranking but do not exclude other colours if they score significantly higher on critic score, vintage, or value.`
        : 'No colour restriction — recommend the best option regardless of colour.';

    const budgetLine = budget
      ? `HARD RULE — BUDGET: The diner's maximum budget is ${sym}${budget} per bottle (currency: ${cur}). Exclude every wine priced above ${sym}${budget} on the menu. Treat all menu prices as being in ${cur}. This is absolute.`
      : '';

    const dislikedRegionsLine = dislikedRegions?.length
      ? `HARD RULE — EXCLUDE REGIONS: Never recommend wines from these regions: ${dislikedRegions.join(', ')}. This is absolute.`
      : '';

    const dislikedGrapesLine = dislikedGrapes?.length
      ? `HARD RULE — EXCLUDE GRAPES: Never recommend wines made primarily from these varieties: ${dislikedGrapes.join(', ')}. This is absolute.`
      : '';

    const topScoringOverride = topScoringMode ? `
TOP SCORING MODE — ACTIVE:
The diner has requested the three highest-scoring wines on the list regardless of any other preference. Ignore colour, style, budget, food pairing, favourite/disliked regions and grapes. Select purely by critic score. Do NOT apply the colour, budget, or exclusion hard rules. Simply rank the wines by critic score and return the top 3. You MUST still populate all fields (vintageAssessment, drinkingWindow, rarityAssessment, criticScoreNote, valueNote, standoutNote, etc.) accurately. The rationale should be honest about any caveats — e.g. poor value, not yet in drinking window, outside the diner's usual preferences.

SUMMARY FIELD — TOP SCORING MODE (MANDATORY OPENING):
The top-level "summary" MUST open by explicitly acknowledging that the diner asked for the highest-scoring wines on the list. This acknowledgement is the VERY FIRST thing in the summary — before any discussion of individual wines, regions, value, or anything else. Address the diner directly in the second person. Open with a sentence along the lines of "You've requested the three top-scoring wines from this list…" — you may vary the wording (e.g. "You asked for the three highest-scoring bottles on this list, so that's what I've sorted for…", "As requested, here are the three top-scoring wines on the list…") but it MUST state up front, in the first sentence, that the selection criterion was top critic score. Only AFTER that opening acknowledgement may you go on to discuss the three picks and their attributes (1–2 further sentences). A summary that opens by describing a wine instead of acknowledging the top-scoring request is a failure.
` : '';

    const mergedStyleProfiles = [...new Set([...(styleProfiles ?? []), ...(profileStyleProfiles ?? [])])];

    const today = new Date().toISOString().split('T')[0];

    const userContext = `
Today's date: ${today} — use this as the anchor when assessing every wine's drinking-window status (Too Young / Approaching / Peak / Fading / Past Peak). Do not rely on training-data assumptions about the current year.

Diner preferences:
- Colour: ${wineTypes?.length ? wineTypes.join(', ') : profileWineTypes?.length ? `${profileWineTypes.join(', ')} (soft preference — do not exclude other colours)` : 'No preference'}
- Style profiles: ${mergedStyleProfiles.length ? mergedStyleProfiles.join(', ') : 'No preference — prioritise quality and value'}
- Budget: up to ${sym}${budget ?? 'unlimited'} per bottle on the menu (${cur})
- Food pairing: ${foodPairing || 'Not specified'}
- Favourite regions (prioritise these): ${favouriteRegions?.length ? favouriteRegions.join(', ') : 'None specified'}
- Favourite grapes (prioritise these): ${favouriteGrapes?.length ? favouriteGrapes.join(', ') : 'None specified'}
- Regions to avoid (EXCLUDE): ${dislikedRegions?.length ? dislikedRegions.join(', ') : 'None'}
- Grapes to avoid (EXCLUDE): ${dislikedGrapes?.length ? dislikedGrapes.join(', ') : 'None'}

${colourLine}
${budgetLine}
${dislikedRegionsLine}
${dislikedGrapesLine}
`;

    const wineListText = JSON.stringify(wines, null, 2);

    const userPrompt = `${topScoringOverride}${userContext}\n\nWine list extracted from menu:\n${wineListText}\n\n${excludeWines?.length ? `HARD RULE — ALREADY SEEN: The diner has already been shown these wines and has asked for a completely fresh alternative set. You MUST NOT recommend any of them again: ${excludeWines.join('; ')}. Choose three DIFFERENT wines from the list. Even if one of these was the strongest option, exclude it and move down to the next-best alternatives — repeating any wine the diner has already seen is a failure.\n\n` : ''}${topScoringMode ? 'TOP SCORING MODE: Return the 3 wines with the highest estimated critic scores on this list.' : 'Recommend exactly 3 wines. Where quality allows, prefer different grape varieties and regions for variety.'} Rank by: critic score → vintage quality → value for money → preference fit.`;

    // Call Claude with up to two attempts. Anthropic returns
    // non-deterministic content so a malformed-JSON failure on the
    // first try is often clean on the second. Distinct retry causes:
    //  - response.content has no text block (rare; mostly when an
    //    extended-thinking or tool_use block precedes)
    //  - the {…} regex matches nothing (response was empty / cut off)
    //  - JSON.parse throws on truncated output
    // Previously any of these surfaced as a 500 and the client saw
    // "Something went wrong" — the cause of the ~1-in-5 scan failures.
    async function attemptClaudeCall(attempt: number): Promise<any> {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 12000,
        system: [
          {
            type: 'text',
            text: SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [{ role: 'user', content: userPrompt }],
      });
      const textBlock = response.content.find((b) => b.type === 'text');
      const text = textBlock?.type === 'text' ? textBlock.text : '';
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) {
        const snippet = text ? text.slice(0, 200) : `(no text block; content types: ${response.content.map((b) => b.type).join(', ')})`;
        if (attempt < 2) {
          console.warn(`[recommend] no JSON in Claude response (attempt ${attempt}), retrying. Snippet: ${snippet}`);
          return attemptClaudeCall(attempt + 1);
        }
        throw new Error(`Claude returned no JSON after ${attempt} attempts. Snippet: ${snippet}`);
      }
      try {
        return JSON.parse(match[0]);
      } catch (parseErr) {
        if (attempt < 2) {
          console.warn(`[recommend] JSON parse failed (attempt ${attempt}), retrying. Detail:`, parseErr);
          return attemptClaudeCall(attempt + 1);
        }
        const detail = parseErr instanceof Error ? parseErr.message : String(parseErr);
        throw new Error(`Claude returned malformed JSON after ${attempt} attempts: ${detail}`);
      }
    }

    const parsed = await attemptClaudeCall(1);

    return new Response(JSON.stringify({ ...parsed, topScoringMode: !!topScoringMode }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Recommend function error:', message);
    // The client reads `message` for its user-facing copy. `error` used to
    // carry the raw exception text — the comment claimed that was "for log
    // diagnostics", but this payload goes to the CLIENT, not the log. The
    // console.error above is the diagnostic path; the raw text (Anthropic SDK
    // request/response detail, or echoed model output on a parse failure)
    // does not need to leave the server.
    //
    // The 429 rate-limit response is returned earlier and never reaches this
    // catch, so extracting.tsx still receives that message intact.
    return new Response(
      JSON.stringify({
        error: 'recommend_failed',
        message: "Vinster had trouble reading the wine list this time. Please try again — usually a second attempt works.",
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
