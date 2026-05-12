import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

Deno.serve(async (req) => {
  try {
    const { producer, region, wineName, vintage, style, colour, currency } = await req.json();
    // Accept either `style` (new) or `colour` (legacy clients still in flight)
    const styleValue: string | null = (typeof style === 'string' && style.trim())
      ? style.trim()
      : (typeof colour === 'string' && colour.trim() ? colour.trim() : null);

    const vintageStr = vintage === 'NV' ? 'Non-Vintage' : vintage;
    const wineNameStr = wineName ? `\n- Wine Name: ${wineName}` : '';
    const styleStr = styleValue ? `\n- Style: ${styleValue} (confirmed by user — use this to disambiguate if producer makes multiple wines of this name)` : '';
    const currentYear = new Date().getFullYear();
    const cur = (currency ?? 'GBP').toString().toUpperCase();

    const prompt = `You are a wine expert with encyclopaedic knowledge of wines, producers, vintages, and critic scores.

Provide intelligence on this wine:
- Producer: ${producer}
- Region: ${region}${wineNameStr}
- Vintage: ${vintageStr}${styleStr}

Return ONLY a valid JSON object with exactly this structure:
{
  "criticScore": <integer 0-100 representing typical critic consensus, or null if very obscure>,
  "criticScoreNote": <single short sentence — 20 words max — explaining why no critic score is available when criticScore is null. e.g. "No published reviews — this is a small-production producer rarely covered by mainstream critics." or "Vintage too young — no major critics have scored this release yet." Set to null when criticScore is provided>,
  "drinkingWindowFrom": <4-digit year when ready to drink, or null>,
  "drinkingWindowTo": <4-digit year by which it should ideally be drunk, or null>,
  "drinkingWindowStatus": <"too_young" | "approaching" | "peak" | "declining" | "unknown">,
  "grapeVariety": <primary grape variety or blend, e.g. "Pinot Noir" or "Grenache/Syrah/Mourvèdre">,
  "tastingNotes": <2-3 sentences describing the wine's character in an elegant sommelier style>,
  "estimatedValue": <integer per-bottle retail estimate in ${cur} from typical independent merchants in the relevant market, or null if too obscure to estimate. Account for vintage scarcity, producer reputation, and current market trends. This is a single point estimate, not a range — be honest about uncertainty by returning null rather than guessing wildly. Return the number only — no currency symbol, no decimals>
}

Base drinking window status on the current year ${currentYear}. Return only the raw JSON — no markdown, no explanation.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const match = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim().match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`No JSON found: ${text.slice(0, 200)}`);

    // Parse-then-restringify so the response is guaranteed to be valid JSON.
    // The previous form called JSON.parse only as a truthiness guard and sent
    // back the raw match[0] string — if Claude's output was truncated by
    // max_tokens the parse threw and the outer catch returned a generic 500
    // that surfaced to users as "Could not refresh / wine-intelligence: …".
    const parsed = JSON.parse(match[0]);
    if (!parsed) {
      return new Response(JSON.stringify({ error: 'empty' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('wine-intelligence error:', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
