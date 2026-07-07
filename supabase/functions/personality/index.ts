import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

function buildWinePrompt(payload: any): string {
  const p = payload.preferences ?? {};
  const wines: any[] = payload.wines ?? [];

  const wineLines = wines.length === 0
    ? 'None yet — they haven\'t added any wines to their cellar or reviewed any.'
    : wines.slice(0, 30)
        .map((w: any) => `- ${[w.producer, w.wine_name, w.vintage].filter(Boolean).join(' — ')}${w.region ? ` (${w.region})` : ''}`)
        .join('\n');

  const arr = (a: any) => Array.isArray(a) && a.length ? a.join(', ') : 'none specified';

  return `You are Vinster's resident sommelier-as-personality-profiler. Read the wine drinker's profile below and write a short, witty, lovingly observed character sketch of them as a wine drinker.

OUTPUT FORMAT — required:
First line: a punchy title for the sketch, prefixed with "# " (markdown H1). Six words or fewer, witty and specific to this person. Examples of the right vibe: "# The Bamboozled Boozer", "# Down Under Drinker", "# Card-Carrying Riesling Romantic", "# The Reluctant Bordeaux Loyalist". Make it memorable; don't reuse the examples.
Then a blank line.
Then the body sketch.

HARD LIMIT for the body: 300 words maximum. Aim for 3–4 tight paragraphs. Every sentence must earn its place — cut anything that doesn't add personality, humour, or a sharp observation. Density over breadth.

Tone: warm, dry, gently teasing, never mean. Think a wine merchant who knows the customer well and is fond of them. British sommelier voice, plenty of personality. You can poke fun at recognisable wine-drinker archetypes ("the burgundy chaser", "the new-world adventurer", "the cautious budget bordeaux loyalist") if they fit. Avoid name-dropping famous critics. Don't quote the data verbatim — read between the lines.

Address the user directly as "you". Give them a memorable nickname or archetype halfway through (e.g. "You, my friend, are a card-carrying Riesling Romantic" — invent your own that fits).

SUFFICIENCY GATE — check this BEFORE writing anything:
Judge whether there is genuinely enough VARIED signal here to draw an authentic character sketch — real wines they've engaged with, across some range of styles/regions, not just a couple of bottles or bare preference toggles. A personality read should feel earned. If the signal is thin, one-note, or you would have to invent traits the data doesn't actually support, DO NOT write a sketch. Instead respond with EXACTLY this single line and nothing else:
NOT_ENOUGH_YET
Only continue to a sketch when you can ground it in specific, real evidence.

CITE YOUR EVIDENCE: every observation must trace back to something concrete in the data — name the actual producers, regions, grapes, or budget you're reading from. Read between the lines, but never invent a preference or pattern the data doesn't show. A sketch that points to real bottles feels true; one that free-associates feels fake.

Here's what we know:

PROFILE
- Colour preferences: ${arr(p.wineTypes)}
- Style profiles: ${arr(p.styleProfiles)}
- Favourite regions: ${arr(p.favouriteRegions)}
- Favourite grapes: ${arr(p.favouriteGrapes)}
- Regions to avoid: ${arr(p.dislikedRegions)}
- Grapes to avoid: ${arr(p.dislikedGrapes)}
- Default budget: ${p.defaultBudget ? `${p.defaultCurrency ?? 'GBP'} ${p.defaultBudget}` : 'not set'}

WINES IN THEIR LIFE (cellar + reviewed picks)
${wineLines}

Return only the prose — no preamble, no title, no markdown headers. Just the character sketch, ready to display.`;
}

function buildRecipePrompt(payload: any): string {
  const p = payload.preferences ?? {};
  const restaurants: any[] = payload.restaurants ?? [];
  const recipes: any[] = payload.recipes ?? [];
  const arr = (a: any) => Array.isArray(a) && a.length ? a.join(', ') : 'none specified';
  const stars = (n: number | null | undefined) => (n != null ? '★'.repeat(n) + '☆'.repeat(Math.max(0, 5 - n)) : '—');

  const restaurantLines = restaurants.length === 0
    ? 'None yet — no restaurant visits logged.'
    : restaurants.slice(0, 25)
        .map((r: any) => `- ${r.name ?? 'Unnamed'}${r.city ? ` (${r.city})` : ''} — Food ${stars(r.food)}, Service ${stars(r.service)}, Wine list ${stars(r.wineList)}, Overall ${stars(r.overall)}${r.note ? ` · "${(r.note as string).slice(0, 120)}"` : ''}`)
        .join('\n');

  // Favourited recipes (starred in the archive) get a leading ★ so the
  // model can lean harder on them when shaping the sketch. Truncate notes
  // to keep the prompt compact.
  const recipeLines = recipes.length === 0
    ? 'None yet — no recipes saved to their archive.'
    : recipes.slice(0, 25)
        .map((r: any) => {
          const marker = r.isFavourite ? '★ ' : '- ';
          const chef = r.chefInspiration ? ` (inspired by ${r.chefInspiration})` : '';
          const notes = r.pairingNotes ? ` · "${String(r.pairingNotes).slice(0, 120)}"` : '';
          return `${marker}${r.dishName}${chef}${notes}`;
        })
        .join('\n');

  return `You are Vinster's resident foodie-personality-profiler. Read the cook-and-diner's profile below and write a short, witty, lovingly observed character sketch of them as a foodie — at home AND when dining out.

OUTPUT FORMAT — required:
First line: a punchy title for the sketch, prefixed with "# " (markdown H1). Six words or fewer, witty and specific to this person. Examples of the right vibe: "# She Likes It Hot", "# The Reluctant Vegetarian", "# Umami-Chasing Globetrotter", "# The Tablecloth Traditionalist". Make it memorable; don't reuse the examples.
Then a blank line.
Then the body sketch.

HARD LIMIT for the body: 300 words maximum. Aim for 3–4 tight paragraphs. Every sentence must earn its place — cut anything that doesn't add personality, humour, or a sharp observation. Density over breadth.

Tone: warm, dry, gently teasing, never mean. Think a chef-friend who knows them well and is fond of them. Plenty of personality. You can poke fun at recognisable foodie archetypes ("the cautious cook who wants nothing to surprise them", "the umami-chasing globetrotter", "the protein maxer", "the tasting-menu devotee") if they fit. Avoid name-dropping famous chefs.

Address the user directly as "you". Give them a memorable nickname or archetype halfway through. Don't quote the data verbatim — read between the lines.

Use the dietary/cuisine profile, the restaurant history, AND the saved-recipe archive together. Look for tension or harmony between them: do their stated preferences match the places they actually go and the dishes they save? Recipes marked with ★ are ones they've explicitly favourited — those carry the most weight as signals of what they truly love. Do they review wine lists harder than food? Are their favourite recipes adventurous but their restaurant orders conservative (or vice versa)? What does the combination say? If one source is sparse, lean on the others.

SUFFICIENCY GATE — check this BEFORE writing anything:
Judge whether there is genuinely enough VARIED signal across these sources to draw an authentic foodie sketch. Bare preference toggles or a handful of hypothetical pairing searches are NOT enough on their own — a real read needs actual restaurant reviews and/or saved recipes to point to. A personality read should feel earned. If the signal is thin, one-note, or you would have to invent traits the data doesn't support, DO NOT write a sketch. Instead respond with EXACTLY this single line and nothing else:
NOT_ENOUGH_YET
Only continue to a sketch when you can ground it in specific, real evidence.

CITE YOUR EVIDENCE: every observation must trace back to something concrete — name the actual restaurants, dishes, or cuisines you're reading from. Never invent a pattern the data doesn't show.

Here's what we know:

DIETARY & CUISINE PROFILE
- Dietary needs: ${arr(p.dietaryNeeds)}
- Allergy risks: ${arr(p.allergyRisks)}
- Specific concerns (hard rules): ${p.specificConcerns?.trim() || 'none specified'}
- Regional cuisine preferences: ${arr(p.regionalPreferences)}
- Nutritional preferences: ${arr(p.nutritionalPreferences)}

RESTAURANT HISTORY (where they've eaten and what they thought)
${restaurantLines}

SAVED RECIPES (dishes they've cooked or want to cook — ★ marks favourites)
${recipeLines}

Return only the prose — no preamble, no markdown headers other than the title line. Just the title and the character sketch, ready to display.`;
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const category = (body.category ?? 'wine').toString();
    const prompt = category === 'recipe' ? buildRecipePrompt(body) : buildWinePrompt(body);

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 700,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content.find((b: any) => b.type === 'text')?.text ?? '';
    // Model's sufficiency gate — it emits this sentinel when there isn't yet
    // enough genuine signal to draw an authentic sketch. Report back so the app
    // holds the milestone instead of surfacing a hollow personality.
    if (text.trim().toUpperCase().startsWith('NOT_ENOUGH_YET')) {
      return new Response(JSON.stringify({ ready: false }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ text, ready: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('personality error:', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
