import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js';
import { requireSignedIn } from '../_shared/auth.ts';
import { HOUSE_RULES } from '../_shared/houseRules.ts';
import { getTasteProfile, tasteProfileSection } from '../_shared/tasteProfile.ts';

// maxRetries covers transient request-setup failures (429/5xx/529 overloaded,
// connection resets) with the SDK's own exponential backoff. Bumped above the
// default 2 because these calls run at restaurant-dinner peak hours when the
// Anthropic API is most likely to be briefly overloaded.
const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')!, maxRetries: 4 });

// Transient = worth retrying (the previous attempt produced nothing usable and
// the condition is temporary): API 408/429/5xx incl. 529 "overloaded", and
// network/connection drops. A parse failure is NOT transient — the model
// already generated a full (if malformed) response, so re-running just burns
// ~60s of wall-clock for the same likely result.
function isTransientError(err: unknown): boolean {
  const e = err as { status?: number; name?: string; message?: string } | null;
  const status = e?.status;
  if (typeof status === 'number' && (status === 408 || status === 429 || status >= 500)) return true;
  const name = e?.name ?? '';
  if (/APIConnection|Timeout|Overloaded|RateLimit|InternalServer|ServiceUnavailable/i.test(name)) return true;
  const msg = (e?.message ?? '').toLowerCase();
  return /overloaded|rate.?limit|timeout|econnreset|socket hang up|network|temporarily|529|503|502|500/.test(msg);
}

// Per-user rate limits — slightly higher than OCR since a single scan can
// trigger multiple recommend calls if the user re-rolls their picks.
// The scan screen's style choices, as the diner saw them (label + description,
// mirroring src/constants/styleProfiles.ts). The app sends only the ids; sent
// bare ("light-red"), the model guessed at them — telling a diner who chose
// Light Reds they'd "asked for Pinot Noir", and putting forward a Sauvignon
// Blanc for Rich Whites.
const STYLE_PROFILE_TEXT: Record<string, string> = {
  'light-red': 'Light Reds (light body with fresh acidity and fruit)',
  'elegant-red': 'Elegant Reds (light to medium body, earthy, complex)',
  'bold-red': 'Bold Reds (full-bodied, tannic, structured)',
  'crisp-white': 'Crisp Whites (high acidity, mineral, refreshing)',
  'aromatic-white': 'Aromatic Whites (floral, off-dry, expressive)',
  'rich-white': 'Rich Whites (full-bodied, oaked, textured)',
  'pale-dry-rose': 'Pale and Dry rosé (Provençal-style: pale, crisp, mineral)',
  'semi-sweet-rose': 'Semi Sweet rosé (off-dry, fruit-forward, gently sweet)',
  'serious-rose': 'Serious Rosé (wine-led, structured)',
  'champagne': 'Champagne (méthode champenoise from Champagne, France)',
  'champagne-style': 'Champagne Style (traditional-method bubbles from outside Champagne)',
  'tank-fermented': 'Tank Fermented sparkling (Charmat method: Prosecco, Lambrusco, frizzante)',
  'natural-cider': 'Funk Me Up natural wine (cloudy, brisk, apple-edged, wild and hazy)',
  'natural-funky': 'Reassuringly Ambiguous natural wine (light, refreshing, easy on the palate)',
  'natural-clean': 'The Good Kind natural wine (clean, minimal sulphites, no faults)',
  'sweet-dry': 'Dry fortified (Fino sherry, dry Madeira)',
  'sweet-semi': 'Semi Sweet fortified (Amontillado, semi-dry Madeira)',
  'sweet-rich': 'Sweet (dessert wines: Sauternes, PX sherry, Tokaji)',
};
const styleText = (id: string) => STYLE_PROFILE_TEXT[id] ?? id;

const RECOMMEND_HOURLY_LIMIT = 60;
const RECOMMEND_DAILY_LIMIT = 200;

const SYSTEM_PROMPT = `You are Vinster, an expert sommelier with encyclopaedic knowledge of wine regions, producers, vintages, critic scores, and market value.

Your task: given a wine list and the diner's preferences, recommend exactly 3 wines ranked by suitability.

SOFT PREFERENCE — GRAPE VARIETY AND REGIONAL DIVERSITY:
Where quality and scoring allow, prefer recommending wines of different grape varieties and from different regions — this gives the diner an interesting range. However, if the best options on the list share a grape variety (e.g. a tightly focused list, or the diner has requested a specific colour that limits variety), recommending them is fine. Quality and preference fit always take priority over diversity.

HARD RULE — COLOUR PREFERENCE:
If the diner has specified one or more colours (red, white, rosé, sparkling), only recommend wines of those colours. This is absolute. If no colour preference is stated, recommend the best option regardless of colour.
The four colour categories are strictly separate: red, white (still only — not sparkling), rosé, sparkling. Champagne and all other sparkling wines count as "sparkling", NOT "white". If the diner has selected "white" but not "sparkling", do not recommend any sparkling or Champagne. If the diner has selected "sparkling" but not "white", do not recommend still white wines.

HARD RULE — BUDGET:
If the diner has stated a budget, exclude ALL wines with a menu price above that budget. This is absolute — do not recommend a wine over budget regardless of quality, rarity, or any other factor. If the wine's menu price is unknown (null), it may be included. If fewer than 3 qualifying wines exist within budget, recommend as many as qualify rather than exceeding the budget.

HARD RULE — REGION AND GRAPE EXCLUSIONS:
If the diner has listed regions or grape varieties to avoid, exclude all wines from those regions or made from those grapes. This is absolute and cannot be overridden by quality or value considerations.

SOFT PREFERENCE — FAVOURITE REGIONS AND GRAPES:
If the diner has listed favourite regions or grape varieties, weight these positively in your ranking. All else being equal, a wine from a favourite region or grape should rank above one that isn't. This is a preference, not a hard filter — do not exclude wines that don't match if they are significantly better quality or value.

NEVER RETURN AN EMPTY LIST WHEN WINES QUALIFY:
A style profile describes how the wine TASTES, judged by this wine's real character (body, oak, texture, acidity) — not by grape name alone. Pick wines that genuinely have the chosen style first. E.g. Rich Whites = full-bodied, oaked or textured (white Burgundy and oaked Chardonnay, white Rhône, Viognier, white Rioja, oaked Chenin, aged Semillon…); a crisp, unoaked Sauvignon Blanc, Muscadet or Picpoul is NOT rich and comes only after every rich white within the hard rules. Light Reds = light body, fresh acidity and fruit, from any grape (Gamay, Pinot Noir, Frappato, Schiava, Zweigelt, cool-climate Grenache…).
Only the HARD rules (colour, budget, region/grape exclusions) can rule a wine out. Style profiles, food pairing, preferred country and favourites are SOFT — they decide the ORDER, never whether there are picks. If at least one wine on the list passes the hard rules, you MUST recommend up to 3 of them (the closest fits), even when none is a perfect match for the stated style or food. When a pick departs from the requested style, say so plainly in its standoutNote (e.g. "Crisper than the rich style you asked for, but the best white within budget here.").

SCORING PRIORITY — after applying the hard rules above, rank by:

1. CRITIC SCORE (apply first)
   Assess each wine's average score across major critics: Wine Spectator, Wine Advocate (Robert Parker), Decanter, Jancis Robinson, and Vinous.
   Wines averaging below 85 points should be ranked down unless the list offers no better options.
   NO SCORE ≠ LOW SCORE: a wine with no critic coverage (common for Greek, Turkish, Lebanese, Georgian, small-grower and other less-reviewed wines) is UNKNOWN to critics, not poor. Never rank it down for that alone. Judge it on appellation standing, grape, the list's own description, value and fit with the diner's style and food.
   LISTS OF MOSTLY LESS-REVIEWED WINES: when most of the list has no critic scores, critic score stops being the first criterion. Rank instead by fit with the diner's style and food → appellation/grape quality → value → drinkability. Don't default to the one famous name on the list (a Champagne house, a Chablis) unless it genuinely fits best — a well-chosen local wine that suits the food is usually the better sommelier's pick.

2. VINTAGE QUALITY (apply second)
   Assess each wine's vintage quality for its specific region and appellation.
   Vintage quality is regional — a poor Burgundy vintage may coincide with a great Barolo vintage.
   A high-scoring wine from a poor vintage should be flagged and ranked lower.

3. DRINKING WINDOW (apply third)
   Assess whether the wine is currently within its optimal drinking window as of today's date.
   Strongly prefer wines at "Peak" or "Approaching" peak — these are the most rewarding to drink now.
   "Too Young" wines should be ranked down unless they are exceptional. "Fading" or "Past Peak" wines should be excluded unless nothing better is available.
   The drinking window should be specific to the vintage and appellation — a 2015 Barolo drinks very differently to a 2015 Pinot Grigio.

4. RARITY AND AGE (apply fourth)
   Assess how rare or hard-to-find the wine is.
   Rare or very rare wines deserve special mention — they represent an unusual opportunity to try something that rarely appears on lists.
   Widely available wines are not penalised but rarity is a positive differentiator when other scores are equal.

   OLDER WINES — ALWAYS PREFER WHERE CRITERIA ARE MET:
   Any wine with a vintage prior to 2015 should be treated differently depending on its style:

   VIABLE older wines (pre-2015 vintages are a positive signal — trust that a sommelier has curated these wisely):
   - Red wines of any region
   - Champagne and traditional-method sparkling wines
   - Fortified wines (Port, Madeira, Sherry, Vin Doux Naturel, etc.)
   - Riesling (any origin — dry, off-dry, or sweet)

   NOT VIABLE (pre-2015 vintages should be flagged as likely past peak and excluded from recommendations unless nothing else qualifies):
   - All other white wines (Chardonnay, Sauvignon Blanc, Pinot Grigio, etc.)
   - Rosé wines
   - Light aromatic whites (Pinot Gris, Gewurztraminer, Viognier, Albariño, etc.)

   When recommending a viable older wine, explicitly call out in the standoutNote that encountering a well-aged bottle of this age on a restaurant list is uncommon, and that the diner should seize the opportunity. Do not second-guess the drinking window for viable older styles — a pre-2015 red, Champagne, fortified wine, or Riesling on a list has passed a sommelier's own judgement and should be treated as ready.

5. VALUE FOR MONEY (apply fifth)
   Compare the real menu price (given for each wine on the list) against the wine's known average market retail price.
   A wine at 1.5x market price or below = good value.
   A wine at 2x market price = fair value.
   A wine at 2.5x+ market price = poor value.
   Prioritise wines that offer the best quality per pound spent.
   This value judgement informs your ranking, and you also express it as the valueNote (see output). IMPORTANT: the valueNote is a FALLBACK ESTIMATE — Vinster shows it to the diner ONLY when live Wine-Searcher market data isn't available for that wine; when Wine-Searcher has data, Vinster shows that real comparison instead of your estimate. The menu price is always real (taken from the list); only your market-retail figure is an estimate, so frame it as one.

6. PREFERENCE FIT (apply last)
   Match against the diner's stated style, food pairing, and budget.
   If no preferences are stated, default to value and quality leadership.

VINTAGE ASSESSMENT RULES:
- Always assess vintage relative to the specific appellation, not the country or broad region.
- E.g. 2011 was poor in Burgundy (both red and white) but fine in parts of Italy.
- Include the vintage context clearly in the vintageAssessment notes.

MISSING VINTAGE (CRITICAL — DO NOT INVENT):
- A blank/absent vintage on a restaurant list almost always means the restaurant simply OMITTED the year — it does NOT mean the wine is non-vintage (NV). Restaurants leave vintages off all the time.
- NEVER label a wine "NV" or invent a "blend of multiple vintages / house style" rationale just because the year is missing. Only treat a wine as genuinely non-vintage when its STYLE is inherently non-vintage AND no year is given — e.g. most Champagne "Brut" / "Brut Réserve" with no year, basic non-vintage sparkling, most sherry, tawny port, cream/solera wines. A still red/white Burgundy, Bordeaux, Barolo, Rioja, etc. with a missing year is a VINTAGED wine whose year the list didn't print — treat it as such, not as NV.
- When the year is missing on a wine that is NOT inherently non-vintage: set vintage to null, and in vintageAssessment.notes state plainly that the vintage isn't listed, then give the honest, hedged reason it can still be recommended — e.g. "The vintage isn't shown on the list, but a recent release of this appellation will be drinking well; if it's more than ~3 years old it should be showing lovely secondary complexity." Do not fabricate a specific year or a specific vintage character you cannot know.

PRICING — READ-ONLY, NEVER OUTPUT:
Each wine in the provided list includes its real menu price, read from the diner's actual menu. Use those real prices to apply the budget rule and to reason about value for money. You must NOT output, restate, alter, or invent any price or currency. Vinster shows the diner the real menu price taken from the list itself, and compares it against live market data — the price is real data and is never authored by you. Your job is to select and analyse the real wines exactly as they exist on the list.

For each recommended wine return:
- name: the wine's proper name or cuvée ONLY, as it appears on the label (e.g. "Pétrus", "Unico", "Les Forts de Latour", "Brut Réserve", "Barolo Cannubi"). Do NOT include the grape variety, region, producer, or vintage in this field — each has its own field below and is shown on a separate line, so putting them here causes duplication. Keep it to the distinguishing name. If a wine has no distinct cuvée beyond its producer/appellation, use the shortest natural label (e.g. the appellation or range name) without repeating the grape or region already captured elsewhere. (string)
- producer: producer (string)
- region: broad region (string)
- appellation: specific appellation if known (string, optional)
- grape: grape variety (string, optional)
- vintage: year as integer or null (number | null)
- flavourProfile: ONE brief sentence (max ~18 words) describing what the wine actually tastes like — fruit, acidity, tannin, body, finish, aromatics. This is a tasting note, NOT a sales pitch. Strict exclusions: no producer name, no vintage information, no critic scores, no rarity / availability comments, no price / value language, no recommendation language ("worth trying", "ideal with", "perfect for"). Pure sensory: think how a sommelier would describe the glass in front of them to a guest who asked "what's this like?". Examples of the right register: "Bright black cherry and graphite, firm fine tannins, savoury herb finish." / "Lifted lemon zest and wet stone, taut acidity, lean and saline." / "Crushed strawberry, gentle spice, soft tannins, easy and fragrant." (string)
- criticScore: average critic score 0–100 for THIS wine as you genuinely know its critic reception (number), or null when you don't genuinely recognise this exact wine — never invent a plausible number (number | null)
- vinsterScore: integer 0–100 — Vinster's OWN holistic score for this wine as a PICK FROM THIS LIST FOR THIS DINER, blending critic score, value for money, drinkability / vintage readiness, rarity / exceptionality and preference fit. This is the score that JUSTIFIES the ranking, and it is deliberately DISTINCT from criticScore: a wine can have a LOWER critic score yet a HIGHER vinsterScore because it drinks better now, offers better value, or fits the diner better. HARD RULE: the #1 (top-ranked) wine MUST have the highest vinsterScore of the three, and vinsterScore MUST be non-increasing with rank (#1 ≥ #2 ≥ #3). Keep scores in a believable, well-spread band (recommended wines typically 88–97). (number)
- criticScoreNote: ONE concise sentence (max ~18 words) on this wine's critic standing IN WORDS, stating its TRUE critic rank AMONG THE THREE PICKS. NO NUMBERS: never write a points score, and never mention Wine-Searcher or the Vinster Score — the app shows the Wine-Searcher score beside the price and adds its own comparison to this line, so a number here would contradict it. CRITICAL: the #1 pick is chosen holistically and is NOT necessarily the most acclaimed — only say "most acclaimed"/"highest" if this wine genuinely has the top criticScore of the three; otherwise state its real position honestly. Name critics only when you genuinely know their verdict. Examples: "The most critically acclaimed of the three, consistently praised by Jancis Robinson and Decanter." / "Strong critical consensus — second of the three on acclaim." (string)
- valueNote: ONE concise sentence (max ~22 words) — a FALLBACK value estimate, shown to the diner ONLY when live Wine-Searcher market data isn't available for the wine. Compare the wine's REAL menu price (from the list) against your best ESTIMATE of its market retail, and frame it clearly as an estimate. If good value say so; if poor value, say so honestly and justify why it still earns its place (rarity, preference fit, quality). Examples: "Estimated around 1.4× retail — likely strong value." / "Roughly 2.5× estimated retail — dear, but its rarity and fit to your taste earn a place." (string)
- vintageAssessment: object with:
    - label: one of "Exceptional" | "Excellent" | "Good" | "Average" | "Challenging" | "Poor" (string)
    - notes: 1 sentence on the vintage character for this specific appellation/year (string)
- drinkingWindow: object with:
    - from: earliest year suitable for drinking as an integer, or null (number | null)
    - to: latest year suitable for drinking as an integer, or null (number | null)
    - status: one of "Too Young" | "Approaching" | "Peak" | "Fading" | "Past Peak" (string)
    - notes: 1 sentence on the current drinking status (string)
- rarityAssessment: object with:
    - label: one of "Very Rare" | "Rare" | "Uncommon" | "Widely Available" (string)
    - notes: 1 sentence on the producer's standing and/or the wine's rarity (e.g. production size, limited distribution, estate reputation). This line is shown on the card under the label "Producer Note", so it MUST OPEN with the producer or the wine's rarity/availability — e.g. "A tiny Mosel grower with barely 4ha…", "Widely available, but…". Never open this sentence with a grape variety, region, or vintage — those each appear elsewhere on the card and leading with them loses the reader. (string)
- outsidePreferences: string | null — almost always null. Colour, budget and excluded regions/grapes are HARD rules: a pick never breaks them. Set this ONLY when a pick CLEARLY goes against a soft preference the user EXPLICITLY stated (a style word they used, a preferred country/region/grape they named, their favourites) — e.g. they asked for "light" and this is a big, heavy red; or they named "Italian" and this is French. It is a short note, quoting their own words, on why it's still worth choosing. Strict rules:
  • Judge style by THIS wine's actual character, never by grape or region stereotypes. Elegance, freshness, richness, etc. are found in many grapes: a Côte-Rôtie or a cool-climate Syrah IS elegant; never imply only Pinot Noir is elegant, only Burgundy is fine, etc. If the wine genuinely has the style asked for, the note is null.
  • The FOOD is never a preference to depart from — how a wine suits the dish belongs in standoutNote. Never write a note about the dish or cuisine, and never compare a wine's origin to a dish (an Italian white for a Thai curry is simply a pairing, not a departure).
  • Never mention a country, region, grape or style the user did not name. Quote ONLY words that appear in the "Diner preferences" above (e.g. "Light Reds", "Rich Whites"). Never say they asked for a grape, region or wine that isn't written there — a style choice like "Light Reds" is NOT a request for Pinot Noir or any other grape. What Vinster has learned about them (the LEARNED section) is not something they asked for: never cite it as their request.
  • If in doubt, null. A note that apologises for a good match confuses the user.
- standoutNote: FOR ALL THREE WINES — ONE to TWO concise sentences (NOT bullet points, ~35 words max) in Vinster's warm, characterful voice. This is the "why THIS one" hook, and it covers two things: (a) PAIRING / occasion — what to drink it with or when (a dish, a moment, a mood), and (b) HOW IT COMPARES with the OTHER TWO wines on this list — the specific reason it earns its place among the three (e.g. the value pick of the trio, the most ready to drink tonight, the boldest, the surest crowd-pleaser, the splurge worth saving for the main). It is NOT a tasting note (that is flavourProfile — never describe fruit/acidity/tannin/body here) and must NOT restate the four labelled param notes (critic score, value, vintage, producer) verbatim. Keep it punchy and specific to THIS list — never generic. Examples: "The one to open with dinner — its savoury depth loves roast lamb, and of the three it's the surest all-rounder tonight." / "Brighter and leaner than the other two, so the pick for shellfish or a warm evening — and the best value of the trio." / "The splurge of the group: rarer and more age-worthy than the others, worth saving for the main course." (string)
- repeatNote: string | null. Set this ONLY when this wine's producer AND name EXACTLY match an entry in the ALREADY-SEEN set (see the rule below) and you are DELIBERATELY recommending that same wine AGAIN because it is genuinely outstanding. NEVER set it on a new or different wine — not even one from the same region or grape as a seen wine (two different Trebbiano d'Abruzzo, or two different Barolos, are NOT the same wine; do not confuse them). It MUST open with EXACTLY "Vinster is recommending this wine again because of its outstanding " and finish with the specific reason. For EVERY other wine — including all wines on a first recommendation, and any fresh alternative — set repeatNote to null.

CRITICAL — CARD NOTE OPENINGS: Four notes are shown on the results card on their own labelled line, and the reader scans only the first few words of each. Every one MUST OPEN with the specific fact named by its label — do not bury it mid-sentence behind a grape variety, region, or other context:
- criticScoreNote (label "Critic Score") → open with the wine's critical standing in words, then its TRUE rank among the picks. E.g. "Strong critical consensus — second of the three…", or "The most acclaimed of the three…" ONLY when genuinely true; never a points number.
- valueNote (label "Value") → open with the value verdict or price-to-retail ratio, framed as an estimate. E.g. "Estimated around 1.4× retail — likely strong value…".
- vintageAssessment.notes + drinkingWindow.notes (label "Vintage/Readiness") → vintageAssessment.notes opens with the vintage's quality for this appellation ("A superb 2016 in Barolo…"); drinkingWindow.notes opens with the readiness status ("Drinking at peak now…").
- rarityAssessment.notes (label "Producer Note") → open with the producer's standing or the wine's rarity/availability. Never open with a grape variety, region, or vintage.

CRITICAL — COMPLETENESS: Every wine object MUST include vinsterScore, criticScoreNote, valueNote AND standoutNote (all three wines get a standoutNote now), and the criticScore key (null when unknown, per below). Never omit these fields for any wine.

CRITICAL — NEVER INVENT (overrides everything above): list text is often OCR'd and misread, and Vinster is discredited by a single made-up fact. Only state facts about a wine you GENUINELY recognise (this producer, this wine). For a wine you don't recognise: criticScore null; criticScoreNote "No critic consensus Vinster can vouch for."; rarityAssessment.notes must not invent producer size, history or reputation — say only what the list itself shows (e.g. "A producer Vinster doesn't know well — judge it on style and price."); vintageAssessment and drinkingWindow speak to the region/year in general, never to the producer; never claim peer comparisons you don't know. Prefer recommending wines you do recognise when the fit is otherwise close.

CRITICAL — VINSTER SCORE vs CRITIC SCORE (two distinct, separately-nameable metrics):
- "Critic Score" (criticScore) = the independent published-critic consensus (Wine Spectator, Wine Advocate, Decanter, Jancis Robinson, Vinous). It measures the wine's quality in the glass, in the abstract. It may be HIGHEST on a lower-ranked pick.
- "Vinster Score" (vinsterScore) = Vinster's OWN holistic verdict on this wine as a pick from THIS list for THIS diner — critic quality PLUS value, drinkability/readiness, rarity and preference fit. It MUST be highest for the #1 pick and non-increasing with rank.
The diner never sees the vinsterScore — it only sets the ranking — so never mention "Vinster Score" in any note. Do NOT put score analysis in standoutNote — that note is for pairing and how the wine compares as a choice on the list. Never claim the #1 pick is the most acclaimed unless its criticScore is genuinely the highest of the three.

CRITICAL — SCORES ARE PER WINE: A critic score (and criticScoreNote) always describes the specific wine and vintage, never the producer as a whole — e.g. "this 2019 bottling is widely acclaimed", not "Raúl Pérez is widely acclaimed".

CRITICAL — EXACT NAMES: Copy each wine's producer and name EXACTLY as they appear in the provided list. NEVER re-spell, autocorrect, translate, or "tidy" a name, and never substitute a more familiar-looking one — e.g. if the list says "Emidio Pepe", write "Emidio Pepe", never "Emilio Pepe". A misspelt producer is a serious error: it points the diner (and Wine-Searcher) at the wrong wine.

Also return a top-level "summary" field: 1–2 sentences summarising your recommendation approach.

Return ONLY valid JSON in this exact format:
{ "wines": [...], "summary": "..." }

Do not include markdown, explanation, or any text outside the JSON.`;

Deno.serve(async (req) => {
  const auth = await requireSignedIn(req);
  if (auth instanceof Response) return auth;

  try {
    // Rate-limit check via service-role RPC. Fail open on infrastructure
    // errors so a Supabase blip doesn't lock out legitimate users.
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const { data: allowed, error: rlError } = await adminClient.rpc('check_and_log_function_call', {
      p_user_id: auth.userId,
      p_function_name: 'recommend',
      p_hourly_limit: RECOMMEND_HOURLY_LIMIT,
      p_daily_limit: RECOMMEND_DAILY_LIMIT,
    });
    if (rlError) {
      console.error('[recommend] rate-limit RPC failed (failing open):', rlError);
    } else if (allowed === false) {
      return new Response(
        JSON.stringify({
          error: 'rate_limit_exceeded',
          message: "You've requested a lot of recommendations recently — please try again in a few minutes.",
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const {
      wines,
      wineTypes,
      styleProfiles,
      budget,
      budgetMin,
      foodPairing,
      preferredCountry,
      favouriteRegions,
      favouriteGrapes,
      dislikedRegions,
      dislikedGrapes,
      excludeWines,
      topScoringMode,
      profileWineTypes,
      profileStyleProfiles,
      currency,
      stream,
      useTasteProfile,
    } = await req.json();

    const cur = (currency ?? 'GBP').toString().toUpperCase();
    const symMap: Record<string, string> = { GBP: '£', USD: '$', EUR: '€', AUD: 'A$', CAD: 'C$', NZD: 'NZ$', JPY: '¥', CHF: 'Fr', HKD: 'HK$', SGD: 'S$' };
    const sym = symMap[cur] ?? cur + ' ';

    const colourLabels: Record<string, string> = {
      red: 'red', white: 'white', rose: 'rosé', sparkling: 'sparkling',
      'sweet-fortified': 'sweet (dessert) or fortified',
    };

    // "Natural / Low Intervention" arrives among the wine types but is a way of
    // making wine, not a colour — it gets its own line below, never the colour rule.
    const isColour = (t: string) => t in colourLabels;
    const colours: string[] = (wineTypes ?? []).filter(isColour);
    const profileColours: string[] = (profileWineTypes ?? []).filter(isColour);
    const wantsNatural = (wineTypes ?? []).includes('natural');
    const likesNatural = !wantsNatural && (profileWineTypes ?? []).includes('natural');

    const colourLine = colours.length
      ? `HARD RULE — COLOUR: Only recommend ${colours.map((t) => colourLabels[t]).join(' or ')} wines. Exclude all other colours absolutely.`
      : profileColours.length
        ? `SOFT PREFERENCE — COLOUR: The diner generally prefers ${profileColours.map((t) => colourLabels[t]).join(' and ')} wines. Weight these positively in your ranking but do not exclude other colours if they score significantly higher on critic score, vintage, or value.`
        : 'No colour restriction — recommend the best option regardless of colour.';

    const naturalLine = wantsNatural || likesNatural
      ? `${wantsNatural ? 'STRONG PREFERENCE' : 'SOFT PREFERENCE'} — NATURAL / LOW INTERVENTION: The diner ${wantsNatural ? 'has asked for' : 'generally likes'} natural or low-intervention wine. Favour wines the list marks as natural, organic, biodynamic, skin-contact or minimal-sulphur, and producers genuinely known for that way of working. Only call a wine natural, organic or biodynamic when the list says so or the producer is well known for it — never assume it from colour, region or obscurity. ${wantsNatural ? 'If no wine on the list clearly fits, pick the closest honest options and say plainly in the summary that the list doesn\'t mark any natural wines.' : 'Do not exclude other wines.'}`
      : '';

    const budgetLine = budget
      ? `HARD RULE — BUDGET (MAX): The diner's maximum budget is ${sym}${budget} per bottle (currency: ${cur}). Exclude every wine priced above ${sym}${budget} on the menu. Each wine's menu price is in its own listed currency (its "currency" field); when that isn't ${cur}, convert it approximately to ${cur} before comparing. This is absolute.`
      : '';

    const budgetMinLine = budgetMin
      ? `HARD RULE — BUDGET (MIN): The diner's minimum budget is ${sym}${budgetMin} per bottle (currency: ${cur}). Exclude every wine priced BELOW ${sym}${budgetMin} on the menu (converting a price in another currency approximately to ${cur} first) — they want to spend at least this much. A wine whose menu price is unknown (null) may be included. This is absolute.`
      : '';

    const dislikedRegionsLine = dislikedRegions?.length
      ? `HARD RULE — EXCLUDE REGIONS: Never recommend wines from these regions: ${dislikedRegions.join(', ')}. This is absolute.`
      : '';

    const dislikedGrapesLine = dislikedGrapes?.length
      ? `HARD RULE — EXCLUDE GRAPES: Never recommend wines made primarily from these varieties: ${dislikedGrapes.join(', ')}. This is absolute.`
      : '';

    const countryPref = typeof preferredCountry === 'string' ? preferredCountry.trim() : '';
    const countryLine = countryPref
      ? `SOFT PREFERENCE — COUNTRY OF ORIGIN: The diner would prefer wines from ${countryPref}. Weight wines from there positively in your ranking, but do NOT exclude wines from elsewhere if they score significantly higher on critic score, value, vintage or overall fit. This is a preference, not a restriction.`
      : '';

    const topScoringOverride = topScoringMode ? `
TOP SCORING MODE — ACTIVE:
The diner has requested the three highest-scoring wines on the list regardless of any other preference. Ignore colour, style, budget, food pairing, preferred country of origin, favourite/disliked regions and grapes. Select purely by critic score. Do NOT apply the colour, budget, or exclusion hard rules. Simply rank the wines by critic score and return the top 3. You MUST still populate all fields (vintageAssessment, drinkingWindow, rarityAssessment, criticScoreNote, valueNote, standoutNote, etc.) accurately. The standoutNote should be honest about any caveats — e.g. poor value, not yet in drinking window, outside the diner's usual preferences.

SUMMARY FIELD — TOP SCORING MODE (MANDATORY OPENING):
The top-level "summary" MUST open by explicitly acknowledging that the diner asked for the highest-scoring wines on the list. This acknowledgement is the VERY FIRST thing in the summary — before any discussion of individual wines, regions, value, or anything else. Address the diner directly in the second person. Open with a sentence along the lines of "You've requested the three top-scoring wines from this list…" — you may vary the wording (e.g. "You asked for the three highest-scoring bottles on this list, so that's what I've sorted for…", "As requested, here are the three top-scoring wines on the list…") but it MUST state up front, in the first sentence, that the selection criterion was top critic score. Only AFTER that opening acknowledgement may you go on to discuss the three picks and their attributes (1–2 further sentences). A summary that opens by describing a wine instead of acknowledging the top-scoring request is a failure.
` : '';

    // What Vinster has learned about this diner (Vinster's Observations) — left
    // out in top-scoring mode, and when scan-start retries without the soft
    // preferences.
    const tasteSection = topScoringMode || useTasteProfile === false
      ? ''
      : tasteProfileSection(await getTasteProfile(req));

    const mergedStyleProfiles = [...new Set([...(styleProfiles ?? []), ...(profileStyleProfiles ?? [])])];

    const today = new Date().toISOString().split('T')[0];

    const userContext = `
Today's date: ${today} — use this as the anchor when assessing every wine's drinking-window status (Too Young / Approaching / Peak / Fading / Past Peak). Do not rely on training-data assumptions about the current year.

Diner preferences:
- Colour: ${colours.length ? colours.join(', ') : profileColours.length ? `${profileColours.join(', ')} (soft preference — do not exclude other colours)` : 'No preference'}
- Style profiles: ${mergedStyleProfiles.length ? mergedStyleProfiles.map(styleText).join('; ') : 'No preference — prioritise quality and value'}
- Budget: ${budgetMin ? `${sym}${budgetMin} (min) to ` : ''}up to ${sym}${budget ?? 'unlimited'} per bottle on the menu (${cur})
- Food pairing: ${foodPairing || 'Not specified'}
- Preferred country of origin (soft preference — weight, do not exclude): ${countryPref || 'No preference'}
- Favourite regions (prioritise these): ${favouriteRegions?.length ? favouriteRegions.join(', ') : 'None specified'}
- Favourite grapes (prioritise these): ${favouriteGrapes?.length ? favouriteGrapes.join(', ') : 'None specified'}
- Regions to avoid (EXCLUDE): ${dislikedRegions?.length ? dislikedRegions.join(', ') : 'None'}
- Grapes to avoid (EXCLUDE): ${dislikedGrapes?.length ? dislikedGrapes.join(', ') : 'None'}

${colourLine}
${naturalLine}
${budgetLine}
${budgetMinLine}
${dislikedRegionsLine}
${dislikedGrapesLine}
${countryLine}
${tasteSection}`;

    const wineListText = JSON.stringify(wines, null, 2);

    const userPrompt = `${topScoringOverride}${userContext}\n\nWine list extracted from menu:\n${wineListText}\n\n${excludeWines?.length ? `ALREADY SEEN — FRESH ALTERNATIVES REQUIRED: The diner has already been shown these wines and asked for a fresh alternative set: ${excludeWines.join('; ')}.
- DEFAULT: recommend THREE DIFFERENT wines from the list that are NOT in that set. Genuinely work down to the next-best options for this diner — simply returning the same names, or 2 of the same 3, is a failure.
- You MAY re-recommend AT MOST ONE already-seen wine, and ONLY when it is genuinely OUTSTANDING and materially better for this diner than every remaining fresh alternative (an exceptional critic score, value, vintage or preference fit that nothing else here matches). The other TWO picks MUST be wines not in the already-seen set. NEVER return two or three already-seen wines.
- If — and ONLY if — you re-recommend an already-seen wine, you MUST populate its "repeatNote" (see the field spec above), opening with exactly "Vinster is recommending this wine again because of its outstanding " and giving the specific reason. Set repeatNote ONLY on a wine that exactly matches an already-seen entry — never on a fresh pick, even a similar one from the same region or grape. Leave repeatNote null for every wine you are not deliberately repeating.\n\n` : ''}${topScoringMode ? 'TOP SCORING MODE: Return the 3 wines with the highest estimated critic scores on this list.' : 'Recommend exactly 3 wines. Where quality allows, prefer different grape varieties and regions for variety.'} Rank by the SCORING PRIORITY above (critic score first when the list is well reviewed; fit, appellation and value first when most wines have no critic coverage).`;

    // ONE streamed Claude call per attempt. Streaming keeps bytes flowing on the
    // edge→Anthropic leg for a long generation, and 8192 max_tokens (matching
    // generate-pairings; plenty for 3 picks) keeps it well inside the function's
    // wall-clock. A parse failure is NOT retried here (that only burns the clock
    // re-running a slow generation — the trap the OCR "times out at 91%" fix
    // removed); only TRANSIENT API/transport errors are retried, in callWithRetry.
    async function attemptClaudeCall(): Promise<any> {
      const claudeStream = await client.messages.create({
        model: 'claude-sonnet-5-5',
        thinking: { type: 'between_tools' },
        max_tokens: 12000,
        system: [
          {
            type: 'text',
            text: SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' },
          },
          { type: 'text', text: HOUSE_RULES },
        ],
        messages: [{ role: 'user', content: userPrompt }],
        stream: true,
      });
      let text = '';
      for await (const event of claudeStream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          text += event.delta.text;
        }
      }
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) {
        throw new Error(`Claude returned no JSON. Snippet: ${text ? text.slice(0, 200) : '(empty)'}`);
      }
      return JSON.parse(match[0]); // throws on malformed → caught by the outer handler
    }

    // Retry ONLY transient API/transport failures — this is what was missing
    // last night: a single attempt against a peak-hours-overloaded API turned
    // every 529/connection blip into a user-facing failure. A mid-stream drop
    // throws out of attemptClaudeCall and lands here; a parse failure is
    // rethrown immediately (not transient) so we don't re-run the slow gen.
    async function callWithRetry(): Promise<any> {
      const MAX_ATTEMPTS = 3;
      let lastErr: unknown;
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
          return await attemptClaudeCall();
        } catch (err) {
          lastErr = err;
          if (attempt >= MAX_ATTEMPTS || !isTransientError(err)) throw err;
          const backoffMs = 600 * Math.pow(2, attempt - 1); // 600ms, 1200ms
          console.warn(`[recommend] transient error on attempt ${attempt}/${MAX_ATTEMPTS}, retrying in ${backoffMs}ms:`, err instanceof Error ? err.message : String(err));
          await new Promise((r) => setTimeout(r, backoffMs));
        }
      }
      throw lastErr;
    }

    // Buffered path (stream !== true): unchanged single-JSON response. Kept as a
    // fallback for clients that can't read a streamed body.
    if (stream !== true) {
      const parsed = await callWithRetry();
      return new Response(JSON.stringify({ ...parsed, topScoringMode: !!topScoringMode }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Streamed path: keep the client connection alive with an SSE heartbeat
    // every few seconds while the ~60s+ generation runs, then emit one final
    // `data:` frame with the validated recommendation (or an error). Mirrors
    // generate-pairings — this is the fix for the recommend timeout on long
    // wine lists.
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
          const parsed = await callWithRetry();
          send(`data: ${JSON.stringify({ ...parsed, topScoringMode: !!topScoringMode })}\n\n`);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error('Recommend stream error:', message);
          // Generic user-facing copy; full detail stays in the log above.
          send(`data: ${JSON.stringify({
            error: 'recommend_failed',
            message: "Vinster had trouble reading the wine list this time. Please try again — usually a second attempt works.",
          })}\n\n`);
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
    console.error('Recommend function error:', message);
    // The client reads `message` for its user-facing copy. `error` used to
    // carry the raw exception text — the comment claimed that was "for log
    // diagnostics", but this payload goes to the CLIENT, not the log. The
    // console.error above is the diagnostic path; the raw text (Anthropic SDK
    // request/response detail, or echoed model output on a parse failure)
    // does not need to leave the server.
    //
    // The 429 rate-limit response is returned earlier and never reaches this
    // catch, so extracting.tsx still receives that message intact.
    // A short, safe failure code for the caller's diagnostics (never the raw text).
    const raw = err instanceof Error ? `${err.name} ${err.message}` : String(err);
    const detail = /truncat|max_tokens/i.test(raw) ? 'truncated'
      : /no JSON|JSON|parse|Unexpected token/i.test(raw) ? 'parse'
      : /overload|529|rate.?limit|429/i.test(raw) ? 'overloaded'
      : /timeout|timed out|aborted/i.test(raw) ? 'timeout'
      : /connection|network|fetch failed|ECONN/i.test(raw) ? 'network'
      : 'other';
    return new Response(
      JSON.stringify({
        error: 'recommend_failed',
        detail,
        message: "Vinster had trouble reading the wine list this time. Please try again — usually a second attempt works.",
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
