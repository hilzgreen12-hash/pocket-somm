import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

const SYSTEM_PROMPT = `You are Pocket Som, an expert sommelier with encyclopaedic knowledge of wine regions, producers, vintages, critic scores, and market value.

Your task: given a wine list and the diner's preferences, recommend up to 3 wines ranked by suitability.

SCORING PRIORITY — follow this order strictly:

1. CRITIC SCORE FILTER (apply first)
   Assess each wine's average score across major critics: Wine Spectator, Wine Advocate (Robert Parker), Decanter, Jancis Robinson, and Vinous.
   Wines averaging below 85 points should be excluded from recommendations unless the list offers no better options.
   If a wine is obscure and scores are unavailable, use your best assessment of quality based on producer reputation and appellation standing.

2. VINTAGE QUALITY (apply second)
   Assess each wine's vintage quality for its specific region and appellation.
   Vintage quality is regional — a poor Burgundy vintage may coincide with a great Barolo vintage.
   A high-scoring wine from a poor vintage should be flagged and ranked lower.

3. VALUE FOR MONEY (apply third)
   Compare the menu price against the wine's known average market retail price.
   A wine at 1.5x market price or below = good value.
   A wine at 2x market price = fair value.
   A wine at 2.5x+ market price = poor value.
   Prioritise wines that offer the best quality per pound spent.

4. PREFERENCE FIT (apply last)
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
- rationale: 2–4 sentences explaining why this wine is recommended, covering score, vintage, and value (string)
- criticScore: estimated average critic score 0–100 (number)
- vintageAssessment: object with:
    - score: 0–100 vintage quality for this region and year (number)
    - label: one of "Exceptional" | "Excellent" | "Good" | "Average" | "Challenging" | "Poor" (string)
    - notes: 1 sentence on the vintage character for this specific appellation/year (string)
- fitScore: 0–100, match to diner's stated preferences (number)
- valueScore: 0–100, value for money at menu price vs estimated market price (number)

Also return a top-level "summary" field: 1–2 sentences summarising your recommendation approach.

Return ONLY valid JSON in this exact format:
{ "wines": [...], "summary": "..." }

Do not include markdown, explanation, or any text outside the JSON.`;

Deno.serve(async (req) => {
  try {
    const { wines, wineType, styleProfiles, budget, foodPairing } = await req.json();

    const wineTypeLabel: Record<string, string> = {
      red: 'Red wine only — exclude all whites, rosé, and sparkling',
      white: 'White wine only — exclude all reds, rosé, and sparkling',
      rose: 'Rosé only — exclude all reds, whites, and sparkling',
      sparkling: 'Sparkling wine only — exclude all still wines',
      any: 'No colour restriction — recommend the best option regardless of type',
    };

    const userContext = `
Diner preferences:
- Wine type: ${wineTypeLabel[wineType] ?? 'No restriction'}
- Style: ${styleProfiles?.length ? styleProfiles.join(', ') : 'No preference — prioritise quality and value'}
- Budget: up to £${budget ?? 'unlimited'} per bottle on the menu
- Food pairing: ${foodPairing || 'Not specified'}
`;

    const wineListText = JSON.stringify(wines, null, 2);

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `${userContext}\n\nWine list extracted from menu:\n${wineListText}\n\nApply the scoring priority (critic score → vintage quality → value for money → preference fit) and recommend up to 3 wines, ranked best first.`,
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract JSON object from response regardless of surrounding text
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`No JSON found in response: ${text.slice(0, 200)}`);
    const parsed = JSON.parse(match[0]);

    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Recommend function error:', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
