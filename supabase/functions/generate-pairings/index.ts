import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

function buildPrompt(wine: Record<string, string | null>, filters: Record<string, unknown>): string {
  const vintageStr = wine.vintage === 'NV' ? 'Non-Vintage (NV)' : wine.vintage;
  const wineNameStr = wine.wineName ? `\n- Wine Name: ${wine.wineName}` : '';
  const colourStr = wine.colour ? `\n- Colour: ${wine.colour} (confirmed by user — treat this as definitive)` : '';

  const constraints: string[] = [];
  const dietary = filters.dietary as string | undefined;
  const allergens = filters.allergens as string[] | undefined;
  const customAllergen = filters.customAllergen as string | undefined;

  if (dietary) {
    const labels: Record<string, string> = {
      vegetarian: 'Vegetarian (no meat or fish)',
      pescatarian: 'Pescatarian (no meat; fish and seafood are allowed)',
      carnivore: 'Carnivore (meat-focused; all proteins welcome)',
      vegan: 'Vegan (no animal products whatsoever)',
    };
    constraints.push(`Dietary preference: ${labels[dietary] ?? dietary}`);
  }
  if (allergens && allergens.length > 0) {
    constraints.push(`Allergen requirements: ${allergens.join(', ')} — all recipes must strictly avoid these.`);
  }
  if (customAllergen?.trim()) {
    constraints.push(`Additional allergen/restriction to avoid: ${customAllergen.trim()}`);
  }

  const constraintBlock = constraints.length > 0
    ? `\nDietary & Allergen Constraints (STRICT — all three recipes must comply):\n${constraints.map((c) => `- ${c}`).join('\n')}\n`
    : '';

  return `You are a world-class sommelier and food pairing expert. Analyse this wine and suggest three outstanding dish pairings with full chef-inspired recipes.

Wine Details:
- Producer: ${wine.producer}
- Region: ${wine.region}${wineNameStr}
- Vintage: ${vintageStr}${colourStr}
${constraintBlock}
Based on this wine's likely taste profile — considering its origin, regional traditions, grape variety, and vintage character — suggest exactly 3 dishes that would pair beautifully with it. Each recipe should be inspired by a real, well-known chef whose culinary style and regional cuisine are a natural fit for the pairing.

Return ONLY a valid JSON object with this exact structure:
{
  "pairings": [
    {
      "dishName": "Full dish name",
      "chefInspiration": "Chef's full name",
      "pairingNotes": "1-2 sentences explaining how the wine and dish complement each other",
      "introduction": "3-4 sentences exploring why this pairing works",
      "recipe": {
        "servings": 4,
        "prepTime": "XX minutes",
        "cookTime": "XX minutes",
        "ingredients": ["quantity ingredient, preparation notes"],
        "instructions": ["Step 1: ..."]
      }
    }
  ]
}

Ensure recipes are complete, detailed, and genuinely worthy of the chef inspiration. Return only the raw JSON — no markdown, no explanation.`;
}

Deno.serve(async (req) => {
  try {
    const { wine, filters } = await req.json();

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      messages: [{ role: 'user', content: buildPrompt(wine, filters ?? {}) }],
    });

    const text = response.content.find((b) => b.type === 'text')?.text ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`No JSON found: ${text.slice(0, 200)}`);

    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed?.pairings) || parsed.pairings.length !== 3) {
      throw new Error('Unexpected response format from Claude');
    }

    return new Response(JSON.stringify({ pairings: parsed.pairings }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('generate-pairings error:', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
