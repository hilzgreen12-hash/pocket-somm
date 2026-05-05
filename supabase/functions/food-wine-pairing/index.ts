import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

function buildCellarPrompt(dish: string, wines: Record<string, string | null>[], difficulty?: string): string {
  const wineList = wines.map((w, i) =>
    `${i + 1}. ${w.wine_name}${w.producer ? ` by ${w.producer}` : ''}${w.region ? `, ${w.region}` : ''}${w.vintage ? ` (${w.vintage})` : ''}${w.grape_variety ? ` — ${w.grape_variety}` : ''} [status: ${w.drinking_window_status}] [id: ${w.id}]`
  ).join('\n');

  const difficultyBlock = difficulty
    ? `\nRecipe Difficulty Preference: ${difficulty} — if you include any recipe tips or serving suggestions, keep them appropriate to this level.\n`
    : '';

  return `You are a world-class sommelier. A user is cooking the following dish and wants to know which wine from their cellar to open.

Dish: ${dish}
${difficultyBlock}
Their cellar:
${wineList}

Select the 1 to 3 wines from this cellar that pair best with the dish. Prioritise wines at "peak" or "approaching" drinking window. If no wines are a strong match, say so honestly and suggest the closest option.

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

function buildGeneralPrompt(dish: string, difficulty?: string): string {
  const difficultyBlock = difficulty
    ? `\nRecipe Difficulty Preference: ${difficulty} — if you include any recipe tips or serving suggestions, keep them appropriate to this level.\n`
    : '';

  return `You are a world-class sommelier. A user is cooking the following dish and wants to know what style of wine to buy.

Dish: ${dish}
${difficultyBlock}
Recommend the single best wine style to complement this dish. Be specific — name the grape variety and region, not just a broad colour.

Return ONLY valid JSON with this structure:
{
  "wineStyle": "e.g. White Burgundy (Chardonnay)",
  "region": "e.g. Côte de Beaune, Burgundy, France",
  "whyItWorks": "2-3 sentences explaining the pairing logic",
  "characteristics": "What to look for on the label or shelf — body, oak, acidity etc.",
  "priceGuide": "e.g. £20–£45",
  "examples": ["Producer or appellation example 1", "Producer or appellation example 2", "Producer or appellation example 3"]
}

Return raw JSON only. No markdown. No explanation.`;
}

Deno.serve(async (req) => {
  try {
    const { dish, mode, cellarWines, difficulty } = await req.json();

    const prompt = mode === 'cellar'
      ? buildCellarPrompt(dish, cellarWines ?? [], difficulty)
      : buildGeneralPrompt(dish, difficulty);

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
