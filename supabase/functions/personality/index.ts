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

  return `You are Vinster's resident sommelier-as-personality-profiler. Read the wine drinker's profile below and write a short, witty, lovingly observed character sketch — 4–6 short paragraphs, ideally — of them as a wine drinker.

Tone: warm, dry, gently teasing, never mean. Think a wine merchant who knows the customer well and is fond of them. British sommelier voice, plenty of personality. You can poke fun at recognisable wine-drinker archetypes ("the burgundy chaser", "the new-world adventurer", "the cautious budget bordeaux loyalist") if they fit. Avoid name-dropping famous critics. Don't quote the data verbatim — read between the lines.

Address the user directly as "you". Give them a memorable nickname or archetype halfway through (e.g. "You, my friend, are a card-carrying Riesling Romantic" — invent your own that fits).

If the data is sparse, lean into that — write a short, playful "we don't know much about you yet, but here's our first impression" piece and invite them to keep building their cellar.

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

function buildRestaurantPrompt(payload: any): string {
  const restaurants: any[] = payload.restaurants ?? [];

  const arr = (a: any) => Array.isArray(a) && a.length ? a.join(', ') : 'none specified';
  const stars = (n: number | null | undefined) => (n != null ? '★'.repeat(n) + '☆'.repeat(Math.max(0, 5 - n)) : '—');

  const restaurantLines = restaurants.length === 0
    ? 'None yet — they haven\'t reviewed any restaurants.'
    : restaurants.slice(0, 25)
        .map((r: any) => `- ${r.name ?? 'Unnamed'}${r.city ? ` (${r.city})` : ''} — Food ${stars(r.food)}, Service ${stars(r.service)}, Wine list ${stars(r.wineList)}, Overall ${stars(r.overall)}${r.note ? ` · "${(r.note as string).slice(0, 120)}"` : ''}`)
        .join('\n');

  return `You are Vinster's resident restaurant-personality-profiler. Read the diner's restaurant review list below and write a short, witty, lovingly observed character sketch — 4–6 short paragraphs, ideally — of them as a restaurant-goer.

Tone: warm, dry, gently teasing, never mean. Think a maître d' who knows them well and is fond of them. Plenty of personality. You can riff on recognisable diner archetypes ("the white-tablecloth loyalist", "the neighbourhood bistro regular", "the tasting-menu obsessive") if they fit. Avoid name-dropping famous chefs.

Address the user directly as "you". Give them a memorable nickname or archetype halfway through. Read between the lines — what do their ratings and notes (high food but low service? consistent love of wine lists?) say about them?

If the data is sparse, lean into that with a playful "early days" piece and invite them to keep building their restaurant book.

Here's what we know:

REVIEWED RESTAURANTS
${restaurantLines}

Return only the prose — no preamble, no title, no markdown headers. Just the character sketch, ready to display.`;
}

function buildRecipePrompt(payload: any): string {
  const p = payload.preferences ?? {};
  const arr = (a: any) => Array.isArray(a) && a.length ? a.join(', ') : 'none specified';

  return `You are Vinster's resident food-personality-profiler. Read the cook's profile below and write a short, witty, lovingly observed character sketch — 4–6 short paragraphs, ideally — of them as an eater.

Tone: warm, dry, gently teasing, never mean. Think a chef-friend who knows them well and is fond of them. Plenty of personality. You can poke fun at recognisable foodie archetypes ("the cautious cook who wants nothing to surprise them", "the umami-chasing globetrotter", "the protein maxer") if they fit. Avoid name-dropping famous chefs.

Address the user directly as "you". Give them a memorable nickname or archetype halfway through. Don't quote the data verbatim — read between the lines.

If the data is sparse, lean into that with a playful "early days" piece and invite them to keep telling Vinster what they like.

Here's what we know:

PROFILE
- Dietary needs: ${arr(p.dietaryNeeds)}
- Allergy risks: ${arr(p.allergyRisks)}
- Specific concerns (hard rules): ${p.specificConcerns?.trim() || 'none specified'}
- Regional cuisine preferences: ${arr(p.regionalPreferences)}
- Nutritional preferences: ${arr(p.nutritionalPreferences)}

Return only the prose — no preamble, no title, no markdown headers. Just the character sketch, ready to display.`;
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const category = (body.category ?? 'wine').toString();
    const prompt = category === 'recipe' ? buildRecipePrompt(body)
      : category === 'restaurant' ? buildRestaurantPrompt(body)
      : buildWinePrompt(body);

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content.find((b: any) => b.type === 'text')?.text ?? '';
    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('personality error:', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
