import Anthropic from 'npm:@anthropic-ai/sdk';
import { checkRateLimit } from '../_shared/rateLimit.ts';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

// A personality sketch is generated rarely per user; these are deliberately
// loose so a legitimate retry never trips them.
const PERSONALITY_HOURLY_LIMIT = 20;
const PERSONALITY_DAILY_LIMIT = 60;

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

// The combined "alter-ego" sketch. Reads BOTH the wine side and the food side
// and, crucially, works out which one the user actually leans into — then
// weights the sketch accordingly. A wine-obsessive gets a wine-forward
// alter-ego; a keen cook/diner gets a food-forward one; someone equally into
// both gets a blended gastronome. This wine-vs-food read is the point.
function buildAlterEgoPrompt(payload: any): string {
  const p = payload.preferences ?? {};
  const wines: any[] = payload.wines ?? [];
  const restaurants: any[] = payload.restaurants ?? [];
  const recipes: any[] = payload.recipes ?? [];
  const arr = (a: any) => Array.isArray(a) && a.length ? a.join(', ') : 'none specified';
  const stars = (n: number | null | undefined) => (n != null ? '★'.repeat(n) + '☆'.repeat(Math.max(0, 5 - n)) : '—');

  const wineLines = wines.length === 0
    ? 'None yet.'
    : wines.slice(0, 30).map((w: any) => `- ${[w.producer, w.wine_name, w.vintage].filter(Boolean).join(' — ')}${w.region ? ` (${w.region})` : ''}`).join('\n');
  const restaurantLines = restaurants.length === 0
    ? 'None yet.'
    : restaurants.slice(0, 25).map((r: any) => `- ${r.name ?? 'Unnamed'}${r.city ? ` (${r.city})` : ''} — Food ${stars(r.food)}, Overall ${stars(r.overall)}${r.note ? ` · "${String(r.note).slice(0, 120)}"` : ''}`).join('\n');
  const recipeLines = recipes.length === 0
    ? 'None yet.'
    : recipes.slice(0, 25).map((r: any) => `${r.isFavourite ? '★ ' : '- '}${r.dishName}${r.chefInspiration ? ` (inspired by ${r.chefInspiration})` : ''}`).join('\n');

  // Rough signal counts so the model can gauge the balance up front.
  const wineSignals = wines.length;
  const foodSignals = restaurants.length + recipes.length;

  return `You are Vinster — a sharp, warm, dry-witted British gastronome. Read the whole person below (their wine life AND their food life) and write ONE short, lovingly observed character sketch: their "alter-ego".

THE KEY JUDGEMENT — do this first:
Work out whether this person is fundamentally a WINE person, a FOOD person, or genuinely both in equal measure. Read it from the relative depth and richness of each side — how many wines vs restaurants/recipes, how specific and considered each is, where their evident passion sits (roughly: ${wineSignals} wine signals vs ${foodSignals} food signals, but weigh QUALITY and specificity, not just counts). Then WEIGHT the sketch accordingly:
- Clearly wine-led → a wine-forward alter-ego; food is a supporting note.
- Clearly food-led → a food-forward alter-ego; wine is a supporting note.
- Genuinely balanced → a blended gastronome who lives at the intersection of the glass and the plate.
Name what they are. This wine-vs-food read is the heart of the sketch — make it feel like Vinster has genuinely clocked where their heart lies.

OUTPUT FORMAT — required:
First line: a punchy title, prefixed with "# " (markdown H1). Six words or fewer, witty and specific. Then a blank line, then the body.

HARD LIMIT for the body: 300 words. 3–4 tight paragraphs, every sentence earning its place.

Tone: warm, dry, gently teasing, never mean — a friend who knows them well and is fond of them. Address them as "you"; give them a memorable nickname or archetype halfway through. Don't quote the data verbatim — read between the lines. Never name-drop famous critics or chefs.

SUFFICIENCY GATE — check BEFORE writing:
There must be enough genuine, varied signal on AT LEAST ONE side (real wines engaged with, or real restaurant reviews / saved recipes) to ground an authentic sketch — not bare preference toggles. If it's too thin to be true, respond with EXACTLY this single line and nothing else:
NOT_ENOUGH_YET

CITE YOUR EVIDENCE: every observation traces to something concrete — name the actual bottles, regions, restaurants or dishes. Never invent a pattern the data doesn't show.

Here's what we know:

WINE PROFILE
- Colour/style: ${arr(p.wineTypes)}${p.styleProfiles ? ` / ${arr(p.styleProfiles)}` : ''}
- Favourite regions/grapes: ${arr(p.favouriteRegions)} / ${arr(p.favouriteGrapes)}
- Budget: ${p.defaultBudget ? `${p.defaultCurrency ?? 'GBP'} ${p.defaultBudget}` : 'not set'}

WINES IN THEIR LIFE (cellar + reviewed picks)
${wineLines}

FOOD PROFILE
- Dietary/cuisine: ${arr(p.dietaryNeeds)} / ${arr(p.regionalPreferences)}

RESTAURANTS (where they eat and what they thought)
${restaurantLines}

SAVED RECIPES (★ = favourited)
${recipeLines}

Return only the prose — the title line then the sketch, ready to display.`;
}

Deno.serve(async (req) => {
  try {
    const limited = await checkRateLimit(req, 'personality', PERSONALITY_HOURLY_LIMIT, PERSONALITY_DAILY_LIMIT);
    if (limited) return limited;

    const body = await req.json();
    const category = (body.category ?? 'wine').toString();
    const prompt = category === 'alter-ego'
      ? buildAlterEgoPrompt(body)
      : category === 'recipe'
        ? buildRecipePrompt(body)
        : buildWinePrompt(body);

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
    // Logged above with full detail. The client gets a generic message:
    // raw exception text can carry Anthropic SDK request/response detail or
    // echo back model output on a JSON parse failure.
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
