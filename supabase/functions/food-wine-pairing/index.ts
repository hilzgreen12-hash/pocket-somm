import Anthropic from 'npm:@anthropic-ai/sdk';
import { checkRateLimit } from '../_shared/rateLimit.ts';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

const PAIRING_HOURLY_LIMIT = 30;
const PAIRING_DAILY_LIMIT = 100;

function symbolFor(code?: string | null): string {
  const map: Record<string, string> = {
    GBP: '£', USD: '$', EUR: '€', AUD: '$', CAD: '$', NZD: '$', JPY: '¥', CHF: 'CHF ', ZAR: 'R',
  };
  return map[code ?? 'GBP'] ?? '';
}

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

// The cooking brief's structured extras — the wine-colour/style preference
// and the per-bottle budget — shared by both prompt builders. Budget is
// expressed differently per mode: cellar filters on what the user already
// paid; general targets a buying price.
function buildBriefBlock(
  stylePreference: string | null | undefined,
  budget: number | null | undefined,
  currency: string,
  mode: 'cellar' | 'general',
): string {
  const lines: string[] = [];
  if (stylePreference) {
    lines.push(`WINE STYLE PREFERENCE: The user wants ${stylePreference} wine. Recommend only ${stylePreference} wines unless nothing of that colour could pair acceptably, in which case explain why.`);
  }
  const sym = symbolFor(currency);
  if (budget != null) {
    if (mode === 'cellar') {
      lines.push(`BUDGET CONTEXT: The user's budget is around ${sym}${budget} per bottle. Each cellar wine below shows its purchase price where known. Favour wines at or below this price when the pairing is strong; recommend a more expensive bottle only if it is a clearly superior match, and say so in the rationale.`);
    } else {
      lines.push(`BUDGET: The user's budget is around ${sym}${budget} per bottle. All three recommendations must be findable at roughly this price. Differentiate the three options by style, grape, region and how well they match the dish — NOT by offering cheaper and pricier tiers.`);
    }
  } else if (mode === 'general') {
    lines.push(`BUDGET: The user has not set a budget. Recommend the three best matches for the dish regardless of price.`);
  }
  return lines.length ? '\n' + lines.join('\n') + '\n' : '';
}

function buildCellarPrompt(
  dish: string,
  wines: Record<string, string | number | null>[],
  stylePreference: string | null | undefined,
  budget: number | null | undefined,
  currency: string,
  userPreferences?: Record<string, any> | null,
): string {
  const wineList = wines.map((w, i) => {
    const price = w.purchase_price != null
      ? ` [paid: ${symbolFor(w.purchase_price_currency as string | null)}${w.purchase_price}]`
      : '';
    return `${i + 1}. ${w.wine_name}${w.producer ? ` by ${w.producer}` : ''}${w.region ? `, ${w.region}` : ''}${w.vintage ? ` (${w.vintage})` : ''}${w.grape_variety ? ` — ${w.grape_variety}` : ''} [status: ${w.drinking_window_status}]${price} [id: ${w.id}]`;
  }).join('\n');

  const briefBlock = buildBriefBlock(stylePreference, budget, currency, 'cellar');
  const preferenceBlock = buildPreferenceBlock(userPreferences);

  return `You are a world-class sommelier. A user is cooking the following dish and wants to know which wine from their cellar to open.

Dish: ${dish}
${briefBlock}${preferenceBlock}

Their cellar:
${wineList}

Select the 1 to 3 wines from this cellar that pair best with the dish. Prioritise wines at "peak" or "approaching" drinking window. Where multiple wines pair equally well, favour those matching the user's profile preferences and budget. If no wines are a strong match, say so honestly and suggest the closest option.

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

function buildGeneralPrompt(
  dish: string,
  stylePreference: string | null | undefined,
  budget: number | null | undefined,
  currency: string,
  userPreferences?: Record<string, any> | null,
): string {
  const briefBlock = buildBriefBlock(stylePreference, budget, currency, 'general');
  const preferenceBlock = buildPreferenceBlock(userPreferences);

  return `You are a world-class sommelier. A user is cooking the following dish and wants to know what wine to buy.

Dish: ${dish}
${briefBlock}${preferenceBlock}

Recommend the top 3 wines that would complement this dish, ranked from best to third-best match. All three must sit at the user's budget level (where one is given) — these are three genuine alternatives at the same price point, NOT a cheap / mid / premium ladder. Be specific — name the grape variety and region, not just a broad colour. Offer real variety across the three (different grapes, regions or styles) so the user has distinct options to choose between.

SOFT RULE — REGIONAL AFFINITY:
Where you can identify the dish's culinary origin (e.g. Italian, French, Spanish, Japanese), give positive weight to wines from that same region or country. A regional match — e.g. a Sicilian white with a Sicilian fish dish, or a Rhône red with a Provençal lamb stew — reflects the centuries of pairing wisdom built into those cuisines and should be favoured where quality allows. This is a preference, not a hard rule: if a non-regional wine is clearly superior on pairing harmony or quality, rank it accordingly and explain why.

SOFT RULE — GRAPE VARIETY AND WORLD EXAMPLES:
When recommending a grape variety strongly associated with one region (e.g. Vermentino with Sardinia/Liguria, Malbec with Mendoza, Grüner Veltliner with Austria), include a note in the "characteristics" or "whyItWorks" field acknowledging that excellent examples exist elsewhere in the world. This helps the user find the style at their local merchant regardless of origin.

Rank by: pairing harmony with the dish → regional affinity → quality and value at the stated budget → availability and ease of finding a good example.

Return ONLY valid JSON with this structure:
{
  "recommendations": [
    {
      "wineStyle": "e.g. White Burgundy (Chardonnay)",
      "region": "e.g. Côte de Beaune, Burgundy, France",
      "whyItWorks": "2-3 sentences explaining the pairing logic and why this ranks above the others",
      "characteristics": "What to look for on the label or shelf — body, oak, acidity etc.",
      "whereToLook": "A specific country + region/appellation where the user can find a good example AT THEIR BUDGET — e.g. 'France, Mâcon-Villages'. Lead with the country. No producers or brand names."
    }
  ],
  "summary": "1-2 sentences on your overall pairing approach for this dish"
}

Return raw JSON only. No markdown. No explanation.`;
}

Deno.serve(async (req) => {
  try {
    const limited = await checkRateLimit(req, 'food-wine-pairing', PAIRING_HOURLY_LIMIT, PAIRING_DAILY_LIMIT);
    if (limited) return limited;

    const { dish, mode, cellarWines, userPreferences, stylePreference, budget } = await req.json();

    // Without this, a malformed request interpolates "Dish: undefined" into
    // the prompt and burns a full Sonnet call on nonsense.
    if (typeof dish !== 'string' || !dish.trim()) {
      return new Response(
        JSON.stringify({ error: 'dish required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }
    const currency = (userPreferences?.defaultCurrency as string | undefined) ?? 'GBP';

    const prompt = mode === 'cellar'
      ? buildCellarPrompt(dish, cellarWines ?? [], stylePreference, budget, currency, userPreferences)
      : buildGeneralPrompt(dish, stylePreference, budget, currency, userPreferences);

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
    // Logged above with full detail. The client gets a generic message:
    // raw exception text can carry Anthropic SDK request/response detail or
    // echo back model output on a JSON parse failure.
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
