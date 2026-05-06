import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

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
- name: wine name (string)
- producer: producer (string)
- region: broad region (string)
- appellation: specific appellation if known (string, optional)
- grape: grape variety (string, optional)
- vintage: year as integer or null (number | null)
- menuPrice: menu price as found on the list (number | null)
- currency: currency code (string)
- rationale: 2–4 sentences explaining why this wine is recommended, covering score, vintage, drinking window, rarity, and value (string)
- criticScore: estimated average critic score 0–100 (number)
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
    - notes: 1 sentence explaining the rarity (e.g. production size, limited distribution) (string)
- outsidePreferences: if this wine breaches any of the diner's stated preferences (budget, colour, excluded region or grape), set this to a short string explaining what the exception is and why the wine is still worth serious consideration — e.g. "This exceeds your £50 budget at £75, but this vintage of Krug is exceptionally rare on restaurant lists and represents a genuinely special opportunity." If the wine is fully within preferences, set this to null.
- topPickReasons: FOR THE FIRST (TOP-RANKED) WINE ONLY — an array of exactly 2 or 3 short, punchy phrases (max 12 words each) that explain why this wine ranks above the other two. These should be the decisive differentiating factors, not generic praise. Draw on the actual scoring dimensions: critic score, vintage quality, drinking window, rarity, and value. Examples of good reasons: "Highest critic score on this list — averaging 96 points", "2015 vintage: exceptional year for this appellation, now at peak", "Best value: menu price just 1.4× market retail". Do NOT pad with vague statements like "a great wine" or "highly recommended". For wines #2 and #3 set topPickReasons to null.

Also return a top-level "summary" field: 1–2 sentences summarising your recommendation approach.

Return ONLY valid JSON in this exact format:
{ "wines": [...], "summary": "..." }

Do not include markdown, explanation, or any text outside the JSON.`;

Deno.serve(async (req) => {
  if (!req.headers.get('Authorization')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
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
The diner has requested the three highest-scoring wines on the list regardless of any other preference. Ignore colour, style, budget, food pairing, favourite/disliked regions and grapes. Select purely by critic score. Do NOT apply the colour, budget, or exclusion hard rules. Simply rank the wines by critic score and return the top 3. You MUST still populate all fields (vintageAssessment, drinkingWindow, rarityAssessment, topPickReasons, etc.) accurately. The rationale should be honest about any caveats — e.g. poor value, not yet in drinking window, outside the diner's usual preferences.
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

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: `${topScoringOverride}${userContext}\n\nWine list extracted from menu:\n${wineListText}\n\n${excludeWines?.length ? `IMPORTANT: The diner has already seen these wines — do NOT recommend any of them: ${excludeWines.join(', ')}. Choose completely different wines.\n\n` : ''}${topScoringMode ? 'TOP SCORING MODE: Return the 3 wines with the highest estimated critic scores on this list.' : 'Recommend exactly 3 wines. Where quality allows, prefer different grape varieties and regions for variety.'} Rank by: critic score → vintage quality → value for money → preference fit.`,
        },
      ],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';

    // Extract JSON object from response regardless of surrounding text
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`No JSON found in response: ${text.slice(0, 200)}`);
    const parsed = JSON.parse(match[0]);

    return new Response(JSON.stringify({ ...parsed, topScoringMode: !!topScoringMode }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Recommend function error:', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
