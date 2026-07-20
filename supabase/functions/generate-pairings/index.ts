import Anthropic from 'npm:@anthropic-ai/sdk';
import { checkRateLimit } from '../_shared/rateLimit.ts';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

// Generous enough that no ordinary session hits them; low enough to cap a
// runaway loop. Tune against real usage — these are a first pass.
const PAIRINGS_HOURLY_LIMIT = 30;
const PAIRINGS_DAILY_LIMIT = 100;

// Curated pool of high-profile chefs Vinster draws inspiration from, so regular
// users stop seeing the same one or two names (Ottolenghi / Nobu) every search.
// Ottolenghi and Nobu stay IN the rotation — they're just no longer the default.
// The order is shuffled per request so repeat searches feel fresh.
const CHEF_POOL = [
  // French
  'Joël Robuchon', 'Alain Ducasse', 'Paul Bocuse', 'Hélène Darroze', 'Anne-Sophie Pic', 'Raymond Blanc', 'Michel Roux Jr', 'Daniel Boulud',
  // Italian
  'Massimo Bottura', 'Giorgio Locatelli', 'Lidia Bastianich', 'Gennaro Contaldo', 'Antonio Carluccio',
  // British
  'Heston Blumenthal', 'Gordon Ramsay', 'Marco Pierre White', 'Rick Stein', 'Tom Kerridge', 'Angela Hartnett', 'Clare Smyth', 'Marcus Wareing', 'Nigella Lawson', 'Yotam Ottolenghi',
  // Spanish
  'Ferran Adrià', 'José Andrés', 'Quique Dacosta',
  // Japanese
  'Nobu Matsuhisa', 'Masaharu Morimoto', 'Yoshihiro Murata',
  // Indian
  'Atul Kochhar', 'Vivek Singh', 'Vineet Bhatia', 'Asma Khan', 'Madhur Jaffrey',
  // Middle Eastern / Levantine
  'Sami Tamimi', 'Sabrina Ghayour', 'Greg Malouf', 'Claudia Roden',
  // Mexican / Latin American
  'Enrique Olvera', 'Gabriela Cámara', 'Pati Jinich', 'Gastón Acurio', 'Virgilio Martínez',
  // American
  'Thomas Keller', 'David Chang', 'Alice Waters', 'Dan Barber', 'Grant Achatz', 'Ina Garten',
  // Nordic
  'René Redzepi', 'Magnus Nilsson',
  // SE Asian / Thai / Chinese
  'David Thompson', 'Ken Hom', 'Kris Yenbamroong',
];

function shuffledChefPool(): string[] {
  const a = [...CHEF_POOL];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildPrompt(
  wine: Record<string, string | null>,
  filters: Record<string, unknown>,
  excludeChefs: string[],
  additionalRequest: string | null,
): string {
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

  // Chef variety — draw the three chef inspirations from across a WIDE pool of
  // different regions, rather than defaulting to the same one or two names every
  // search. Pairing quality still comes first; among chefs who genuinely suit
  // the wine and dish, spread the picks and rotate so repeat searches feel fresh.
  const chefPoolBlock = `\nChef Inspiration (HARD RULE — variety matters): pick the three chef inspirations from across this wide pool, choosing chefs from DIFFERENT regions/traditions for the three recipes. Prioritise chefs whose style genuinely suits the wine and the dish, but do NOT default to the same one or two names search after search — spread your choices across the pool. Pool (no particular order): ${shuffledChefPool().join(', ')}. You may occasionally use an equally well-known chef not on this list if the pairing truly calls for it.\n`;

  // Course the user is planning — when set, ALL three recipes must be that
  // course (e.g. three different starters, or three different mains).
  const course = filters.course as string | undefined;
  const courseBlock = course
    ? `\nCourse (HARD RULE — all three recipes must be this exact course): ${course}. ${
        course.startsWith('Amuse')
          ? 'Elegant one- or two-bite canapés / amuse-bouche to open a meal — small, refined, pre-dinner bites, NOT full plates.'
          : course === 'Starter'
            ? 'Light, refined first courses / starters — opening plates, smaller than a main.'
            : course === 'Main'
              ? 'Substantial main-course centrepiece dishes.'
              : 'Sweet puddings / desserts to finish a meal — match them to the sweetness and acidity of the wine.'
      } Offer three genuinely different dishes within this one course.\n`
    : '';

  const timeConsideration = filters.timeConsideration as string | undefined;
  const timeBlock = timeConsideration
    ? `\nTime Budget (HARD RULE — combined prep + cook time must fit): ${timeConsideration}. The user has chosen this window deliberately; do not propose dishes that exceed it. "Time is of the Essence" = under 30 minutes total. "Easy Breezy" = under 1 hour total. "I've got all day" = up to 3 hours total. "Low & Slow" = 3 hours or more (lean into braises, slow roasts, fermentation, stocks, anything that benefits from extended time).\n`
    : `\nTime Budget: NOT specified by the user. Default to MIDDLING timeframes — each recipe's combined prep + cook should sit around 45–75 minutes (sweet spot for a deliberate weeknight or relaxed weekend dinner). Avoid both extremes — nothing under 30 minutes and nothing over 90 minutes.\n`;

  const servings = filters.servings as number | undefined;
  const servingsBlock = servings && servings > 0
    ? `\nServings (HARD RULE): the user is cooking for ${servings} ${servings === 1 ? 'person' : 'people'}. Scale every recipe's ingredient quantities to serve exactly ${servings}, and set "servings" to ${servings} in each recipe.\n`
    : '';

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

  // When the user taps "generate another set", we feed back the chefs
  // (and dish names if we ever extend this) that already appeared in
  // previous rounds so Claude doesn't churn out near-duplicates. The
  // hard-rule wording matters — without it the model treats this as a
  // soft nudge and still falls back on its favourites.
  const excludeChefsBlock =
    excludeChefs.length > 0
      ? `\nChef Diversity (HARD RULE — these chefs have already been used in earlier sets for this same wine and MUST NOT appear again): ${excludeChefs.join(', ')}. Pick three entirely different chefs whose styles still fit this wine. Reach beyond the most-cited names — French, Italian, Spanish, Japanese, Mexican, Peruvian, Lebanese, Indian, Turkish, Nordic and modern American chefs all qualify. Each of the three new recipes must be inspired by a chef NOT in the above list AND not by a chef who has already been used in this conversation context.\n`
      : '';

  // Free-form user request from the regen modal — e.g. "Show me
  // Japanese inspired pairings" or "recipes with fresh vegetables".
  // Treated as a strong soft preference: the model should lean into it
  // across the set but not abandon pairing quality to satisfy a brief
  // that contradicts the wine.
  const additionalRequestBlock =
    additionalRequest && additionalRequest.trim().length > 0
      ? `\nUser's Steer For This Set (STRONG PREFERENCE — apply across all three recipes where the wine allows): "${additionalRequest.trim()}". Lean firmly into this direction. If the wine is genuinely poorly suited to the request, prioritise pairing quality and explain the connection — but try hard to honour the user's brief.\n`
      : '';

  return `You are a world-class sommelier and food pairing expert. Analyse this wine and suggest three outstanding dish pairings with full chef-inspired recipes.

Wine Details:
- Producer: ${wine.producer}
- Region: ${wine.region}${wineNameStr}
- Vintage: ${vintageStr}${colourStr}
${courseBlock}${constraintBlock}${servingsBlock}${softBlock}${asianBlock}${regionalDiversityBlock}${chefPoolBlock}${excludeChefsBlock}${additionalRequestBlock}${difficultyBlock}${diversityBlock}${timeBlock}
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

// Pull the JSON object out of Claude's reply and validate it. Shared by both
// the buffered and streamed response paths so they enforce identical contracts.
function extractPairings(text: string): unknown[] {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`No JSON found: ${text.slice(0, 200)}`);
  const parsed = JSON.parse(match[0]);
  if (!Array.isArray(parsed?.pairings) || parsed.pairings.length !== 3) {
    throw new Error('Unexpected response format from Claude');
  }
  return parsed.pairings;
}

Deno.serve(async (req) => {
  try {
    // Highest-cost function in the project: 8192 max_tokens on Sonnet, held
    // open as an SSE stream for ~65s. Gate before doing any work.
    const limited = await checkRateLimit(req, 'generate-pairings', PAIRINGS_HOURLY_LIMIT, PAIRINGS_DAILY_LIMIT);
    if (limited) return limited;

    const { wine, filters, excludeChefs, additionalRequest, stream } = await req.json();
    const excludeChefsList = Array.isArray(excludeChefs)
      ? (excludeChefs as unknown[]).filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
      : [];
    const additionalRequestText = typeof additionalRequest === 'string' && additionalRequest.trim().length > 0
      ? additionalRequest
      : null;

    // Bump temperature on regeneration rounds (anything that ships an
    // excludeChefs list or a steer is by definition a regen). Default
    // SDK temperature is around 1.0; pushing to 1.0 explicitly + giving
    // the model the exclude list is what actually breaks the
    // "same three chefs every time" loop the user reported.
    const isRegeneration = excludeChefsList.length > 0 || !!additionalRequestText;
    const temperature = isRegeneration ? 1.0 : 0.8;

    const params = {
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      temperature,
      messages: [{ role: 'user' as const, content: buildPrompt(wine, filters ?? {}, excludeChefsList, additionalRequestText) }],
    };

    // Buffered path (stream !== true): unchanged behaviour, one JSON response.
    // Kept as a fallback for clients that can't read a streamed body.
    if (stream !== true) {
      const response = await client.messages.create(params);
      const text = response.content.find((b) => b.type === 'text')?.text ?? '';
      const pairings = extractPairings(text);
      return new Response(JSON.stringify({ pairings }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Streamed path: this whole generation runs ~65s, and a single idle HTTP
    // connection held that long is exactly what carrier NAT / tower handover
    // kills on cellular (the "only works on WiFi" failure). We don't forward
    // Claude's partial text to the client — we just keep bytes flowing with an
    // SSE heartbeat every few seconds so the connection never idles out, then
    // emit one final `data:` frame with the validated result (or an error).
    const encoder = new TextEncoder();
    const body = new ReadableStream({
      async start(controller) {
        const send = (s: string) => {
          try { controller.enqueue(encoder.encode(s)); } catch { /* closed */ }
        };
        // First bytes immediately, before time-to-first-token, so the client's
        // idle timer starts ticking against real traffic.
        send(': open\n\n');
        const heartbeat = setInterval(() => send(': ping\n\n'), 8000);
        try {
          let full = '';
          const claudeStream = await client.messages.create({ ...params, stream: true });
          for await (const event of claudeStream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              full += event.delta.text;
            }
          }
          const pairings = extractPairings(full);
          send(`data: ${JSON.stringify({ pairings })}\n\n`);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error('generate-pairings stream error:', message);
          send(`data: ${JSON.stringify({ error: message })}\n\n`);
        } finally {
          clearInterval(heartbeat);
          controller.close();
        }
      },
    });

    return new Response(body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('generate-pairings error:', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
