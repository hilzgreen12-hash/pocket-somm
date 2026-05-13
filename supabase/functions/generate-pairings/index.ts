import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

function buildPrompt(wine: Record<string, string | null>, filters: Record<string, unknown>): string {
  const vintageStr = wine.vintage === 'NV' ? 'Non-Vintage (NV)' : wine.vintage;
  const wineNameStr = wine.wineName ? `\n- Wine Name: ${wine.wineName}` : '';
  const colourStr = wine.style ? `\n- Style: ${wine.style} (confirmed by user — treat this as definitive)` : '';

  const constraints: string[] = [];
  const dietary = filters.dietary as string | undefined;
  const allergens = filters.allergens as string[] | undefined;
  const customAllergen = filters.customAllergen as string | undefined;
  const specificConcerns = filters.specificConcerns as string | undefined;

  if (dietary) {
    const key = dietary.toString().toLowerCase();
    const labels: Record<string, string> = {
      vegetarian: 'Vegetarian (no meat or fish)',
      pescatarian: 'Pescatarian (no meat; fish and seafood are allowed)',
      carnivore: 'Carnivore (meat-focused; all proteins welcome)',
      vegan: 'Vegan (no animal products whatsoever)',
    };
    constraints.push(`Dietary preference: ${labels[key] ?? dietary}`);
  }
  if (allergens && allergens.length > 0) {
    constraints.push(`Allergen requirements: ${allergens.join(', ')} — all recipes must strictly avoid these.`);
  }
  if (customAllergen?.trim()) {
    constraints.push(`Additional allergen/restriction to avoid: ${customAllergen.trim()}`);
  }
  if (specificConcerns?.trim()) {
    constraints.push(`Specific concerns from user (HARD RULE — must be respected in every recipe): ${specificConcerns.trim()}`);
  }

  const dietaryNote = filters.dietaryNote as string | undefined;
  if (dietaryNote?.trim()) {
    constraints.push(`Additional dietary note from user: ${dietaryNote.trim()} — treat this as a strict constraint across all three recipes.`);
  }

  const difficulty = filters.difficulty as string | undefined;
  const difficultyBlock = difficulty
    ? `\nRecipe Difficulty: ${difficulty} — all three recipes must match this difficulty level. "Super Simple" means minimal ingredients and steps, ready in under 30 minutes. "Easy to Moderate" means accessible home cooking with some technique. "Challenging" means restaurant-quality dishes requiring skill and precision. "Very Technical" means advanced culinary techniques such as sous vide, fermentation, complex sauces, or multi-stage preparations.\n`
    : `\nRecipe Difficulty: NOT specified by the user. Default to MIDDLING difficulty — all three recipes should sit firmly in the "Easy to Moderate" band: accessible home cooking with some real technique, but no advanced or restaurant-only methods. Avoid both extremes — no 10-minute throw-togethers and no sous-vide / fermentation / multi-stage chef plates.\n`;
  const diversityBlock = '';

  const timeConsideration = filters.timeConsideration as string | undefined;
  const timeBlock = timeConsideration
    ? `\nTime Budget (HARD RULE — combined prep + cook time must fit): ${timeConsideration}. The user has chosen this window deliberately; do not propose dishes that exceed it. "Time is of the Essence" = under 30 minutes total. "Easy Breezy" = under 1 hour total. "I've got all day" = up to 3 hours total. "Low & Slow" = 3 hours or more (lean into braises, slow roasts, fermentation, stocks, anything that benefits from extended time).\n`
    : `\nTime Budget: NOT specified by the user. Default to MIDDLING timeframes — each recipe's combined prep + cook should sit around 45–75 minutes (sweet spot for a deliberate weeknight or relaxed weekend dinner). Avoid both extremes — nothing under 30 minutes and nothing over 90 minutes.\n`;

  const constraintBlock = constraints.length > 0
    ? `\nDietary & Allergen Constraints (STRICT — all three recipes must comply):\n${constraints.map((c) => `- ${c}`).join('\n')}\n`
    : '';

  const regionalPreferences = filters.regionalPreferences as string[] | undefined;
  const nutritionalPreferences = filters.nutritionalPreferences as string[] | undefined;
  const softParts: string[] = [];
  if (regionalPreferences && regionalPreferences.length > 0) {
    softParts.push(`Preferred regional cuisines: ${regionalPreferences.join(', ')}. Lean toward these traditions when they suit the wine, but do not force a poor pairing for the sake of cuisine matching.`);
  }
  if (nutritionalPreferences && nutritionalPreferences.length > 0) {
    softParts.push(`Nutritional goals: ${nutritionalPreferences.join(', ')}. Where reasonable, prefer recipes that align with these goals.`);
  }
  const softBlock = softParts.length > 0
    ? `\nSoft Preferences (NUDGES, NOT HARD RULES — pairing quality comes first):\n${softParts.map((s) => `- ${s}`).join('\n')}\n`
    : '';

  // Diversity nudge: unless the user has explicitly opted in to only
  // European cuisines, one of the three recipes should pick up
  // East / South Asian flavours so the set doesn't skew exclusively
  // Mediterranean / French. Stops short of a fully traditional Asian
  // dish (which assumes specialist ingredients and techniques home
  // cooks may not have) — we want Asian-inspired Western/fusion.
  const EUROPEAN_CUISINES = new Set(['Italian', 'French', 'Spanish', 'Greek', 'Mediterranean']);
  const userPickedOnlyEuropean =
    !!regionalPreferences &&
    regionalPreferences.length > 0 &&
    regionalPreferences.every((c) => EUROPEAN_CUISINES.has(c));
  const asianBlock = userPickedOnlyEuropean
    ? ''
    : '\nDiversity (HARD RULE): exactly ONE of the three recipes must be Asian-influenced. Borrow flavours, sauces or techniques from East or South Asian cooking (e.g. miso, soy, ginger, fish sauce, gochujang, ponzu, tamarind, lemongrass, sesame, yuzu, garam masala, cumin/coriander) but keep the format approachable for a home cook who is not an Asian-cuisine specialist. Think Asian-inspired Western or fusion plate — not a fully traditional dish. Avoid recipes requiring from-scratch curry pastes, homemade ramen broth, hand-rolled dumplings, sushi rice or wok-fire-only techniques. The other two recipes can take any other direction the wine suggests.\n';

  // Regional variety when the user has expressed no regional preference.
  // Without this nudge the model tends to anchor the whole set in
  // Italian / French / Mediterranean. We want three genuinely different
  // cuisine traditions across the set (one of which is already Asian
  // per the rule above, leaving the other two for other regions).
  const regionalDiversityBlock =
    !regionalPreferences || regionalPreferences.length === 0
      ? '\nRegional Variety (HARD RULE — when the user has set no cuisine preference): the three recipes must each draw from a DIFFERENT regional/cuisine tradition. Spread them across distinct origins (for example: one Italian, one Middle Eastern, one Latin American — or one French bistro, one Japanese-influenced, one North African). Do NOT anchor two or three recipes in the same tradition. Asian-influenced fills one slot per the diversity rule above; the remaining two must come from two further, different regions.\n'
      : '';

  return `You are a world-class sommelier and food pairing expert. Analyse this wine and suggest three outstanding dish pairings with full chef-inspired recipes.

Wine Details:
- Producer: ${wine.producer}
- Region: ${wine.region}${wineNameStr}
- Vintage: ${vintageStr}${colourStr}
${constraintBlock}${softBlock}${asianBlock}${regionalDiversityBlock}${difficultyBlock}${diversityBlock}${timeBlock}
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
