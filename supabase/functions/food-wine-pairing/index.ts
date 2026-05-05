import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

function buildPreferenceBlock(prefs: Record<string, any> | null | undefined): string {
  if (!prefs) return '';
  const lines: string[] = [];
  const colourLabels: Record<string, string> = { red: 'red', white: 'white', rose: 'rosé', sparkling: 'sparkling' };
  if (prefs.wineTypes?.length)
    lines.push(`HARD RULE — COLOUR: Only recommend ${prefs.wineTypes.map((t: string) => colourLabels[t] ?? t).join(' or ')} wines. Exclude all other colours absolutely.`);
  if (prefs.dislikedRegions?.length)
    lines.push(`HARD RULE — EXCLUDE REGIONS: Never recommend wines from: ${prefs.dislikedRegions.join(', ')}. This is absolute.`);
  if (prefs.dislikedGrapes?.length)
    lines.push(`HARD RULE — EXCLUDE GRAPES: Never recommend wines made primarily from: ${prefs.dislikedGrapes.join(', ')}. This is absolute.`);
  if (prefs.favouriteRegions?.length)
    lines.push(`SOFT PREFERENCE — FAVOURITE REGIONS: The user particularly enjoys wines from: ${prefs.favouriteRegions.join(', ')}. Weight these positively where quality and pairing harmony allow.`);
  if (prefs.favouriteGrapes?.length)
    lines.push(`SOFT PREFERENCE — FAVOURITE GRAPES: The user particularly enjoys wines made from: ${prefs.favouriteGrapes.join(', ')}. Weight these positively where quality and pairing harmony allow.`);
  if (prefs.styleProfiles?.length)
    lines.push(`SOFT PREFERENCE — STYLE: The user prefers wines that are: ${prefs.styleProfiles.join(', ')}.`);
  return lines.length ? '\n\nUser wine profile preferences:\n' + lines.join('\n') : '';
}

function buildCellarPrompt(dish: string, wines: Record<string, string | null>[], difficulty?: string, userPreferences?: Record<string, any> | null): string {
  const wineList = wines.map((w, i) =>
    `${i + 1}. ${w.wine_name}${w.producer ? ` by ${w.producer}` : ''}${w.region ? `, ${w.region}` : ''}${w.vintage ? ` (${w.vintage})` : ''}${w.grape_variety ? ` — ${w.grape_variety}` : ''} [status: ${w.drinking_window_status}] [id: ${w.id}]`
  ).join('\n');

  const difficultyBlock = difficulty
    ? `\nRecipe Difficulty Preference: ${difficulty} — if you include any recipe tips or serving suggestions, keep them appropriate to this level.\n`
    : '';

  const preferenceBlock = buildPreferenceBlock(userPreferences);

  return `You are a world-class sommelier. A user is cooking the following dish and wants to know which wine from their cellar to open.

Dish: ${dish}
${difficultyBlock}${preferenceBlock}

Their cellar:
${wineList}

Select the 1 to 3 wines from this cellar that pair best with the dish. Prioritise wines at "peak" or "approaching" drinking window. Where multiple wines pair equally well, favour those matching the user's profile preferences. If no wines are a strong match, say so honestly and suggest the closest option.

Return ONLY valid JSON with this structure:
{
  "recommendations": [
    {
      "cellarWineId": "the id field from above",
      "wineName": "wine name",
      "rationale": "2-3 sentences explaining why this wine works with the dish",
      "servingTip": "1 sentence on temperature, decanting, or glassware"
    }
  ]
}

Return raw JSON only. No markdown. No explanation.`;
}

function buildGeneralPrompt(dish: string, difficulty?: string, userPreferences?: Record<string, any> | null): string {
  const difficultyBlock = difficulty
    ? `\nRecipe Difficulty Preference: ${difficulty} — if you include any recipe tips or serving suggestions, keep them appropriate to this level.\n`
    : '';
  const preferenceBlock = buildPreferenceBlock(userPreferences);

  return `You are a world-class sommelier. A user is cooking the following dish and wants to know what style of wine to buy.

Dish: ${dish}
${difficultyBlock}${preferenceBlock}

Recommend the top 3 wine styles that would complement this dish, ranked from best to third-best match. Be specific — name the grape variety and region, not just a broad colour. Where possible, offer variety across the three recommendations (different grapes, regions, or styles) so the user has genuine options to consider.

SOFT RULE — REGIONAL AFFINITY:
Where you can identify the dish's culinary origin (e.g. Italian, French, Spanish, Japanese), give positive weight to wines from that same region or country. A regional match — e.g. a Sicilian white with a Sicilian fish dish, or a Rhône red with a Provençal lamb stew — reflects the centuries of pairing wisdom built into those cuisines and should be favoured where quality allows. This is a preference, not a hard rule: if a non-regional wine is clearly superior on pairing harmony or quality, rank it accordingly and explain why.

SOFT RULE — GRAPE VARIETY AND WORLD EXAMPLES:
When recommending a grape variety strongly associated with one region (e.g. Vermentino with Sardinia/Liguria, Malbec with Mendoza, Grüner Veltliner with Austria), include a note in the "characteristics" or "whyItWorks" field acknowledging that excellent examples exist elsewhere in the world — e.g. "While Vermentino is most celebrated in Sardinia and Liguria, you'll find outstanding examples from Corsica, southern France, and California." This helps the user find the style at their local merchant regardless of origin.

Rank by: pairing harmony with the dish → regional affinity → quality and value at the stated price point → availability and ease of finding a good example.

Return ONLY valid JSON with this structure:
{
  "recommendations": [
    {
      "wineStyle": "e.g. White Burgundy (Chardonnay)",
      "region": "e.g. Côte de Beaune, Burgundy, France",
      "whyItWorks": "2-3 sentences explaining the pairing logic and why this ranks above the others",
      "characteristics": "What to look for on the label or shelf — body, oak, acidity etc.",
      "priceGuide": "e.g. £20–£45",
      "examples": ["Producer or appellation example 1", "Producer or appellation example 2", "Producer or appellation example 3"]
    }
  ],
  "summary": "1-2 sentences on your overall pairing approach for this dish"
}

Return raw JSON only. No markdown. No explanation.`;
}

Deno.serve(async (req) => {
  try {
    const { dish, mode, cellarWines, difficulty, userPreferences } = await req.json();

    const prompt = mode === 'cellar'
      ? buildCellarPrompt(dish, cellarWines ?? [], difficulty, userPreferences)
      : buildGeneralPrompt(dish, difficulty, userPreferences);

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content.find((b) => b.type === 'text')?.text ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`No JSON found: ${text.slice(0, 200)}`);

    const parsed = JSON.parse(match[0]);
    return new Response(JSON.stringify({ mode, ...parsed }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('food-wine-pairing error:', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
