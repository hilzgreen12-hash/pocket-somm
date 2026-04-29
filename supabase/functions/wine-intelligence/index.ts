import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

Deno.serve(async (req) => {
  try {
    const { producer, region, wineName, vintage, colour } = await req.json();

    const vintageStr = vintage === 'NV' ? 'Non-Vintage' : vintage;
    const wineNameStr = wineName ? `\n- Wine Name: ${wineName}` : '';
    const colourStr = colour ? `\n- Colour: ${colour} (confirmed by user — use this to disambiguate if producer makes multiple wines of this name)` : '';
    const currentYear = new Date().getFullYear();

    const prompt = `You are a wine expert with encyclopaedic knowledge of wines, producers, vintages, and critic scores.

Provide intelligence on this wine:
- Producer: ${producer}
- Region: ${region}${wineNameStr}
- Vintage: ${vintageStr}${colourStr}

Return ONLY a valid JSON object with exactly this structure:
{
  "criticScore": <integer 0-100 representing typical critic consensus, or null if very obscure>,
  "drinkingWindowFrom": <4-digit year when ready to drink, or null>,
  "drinkingWindowTo": <4-digit year by which it should ideally be drunk, or null>,
  "drinkingWindowStatus": <"too_young" | "approaching" | "peak" | "declining" | "unknown">,
  "grapeVariety": <primary grape variety or blend, e.g. "Pinot Noir" or "Grenache/Syrah/Mourvèdre">,
  "tastingNotes": <2-3 sentences describing the wine's character in an elegant sommelier style>
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

    return new Response(JSON.parse(match[0]) ? match[0] : JSON.stringify({ error: 'empty' }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('wine-intelligence error:', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
