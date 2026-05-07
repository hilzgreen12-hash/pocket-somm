import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

const LABEL_SCAN_PROMPT = `You are a wine expert analyzing a wine label photograph. Extract the following information from this label:

1. producer: The winery or producer name
2. region: The wine region, appellation, or country of origin
3. wineName: The specific wine name or cuvée (the individual wine's name, distinct from the producer). Set to null if there is no specific wine name beyond the producer name.
4. vintage: The vintage year as a 4-digit string (e.g. "2019"), "NV" if the label explicitly states non-vintage, or null if no vintage information is visible.
5. style: One of "Red", "White", "Rosé", "Sparkling", or "Fortified". This is NOT optional — every wine has a style. If the label doesn't visually state it, infer from the producer, region, appellation, or wine name. Champagne and other traditional-method sparkling wines are "Sparkling". Port, Madeira, Sherry are "Fortified". Use your best judgement; do not return null.

Return ONLY a valid JSON object with exactly these five keys. Set any field other than style to null if you cannot confidently identify it from the label. Do not include any explanation or markdown — only the raw JSON.

Example: {"producer": "Château Margaux", "region": "Margaux, Bordeaux", "wineName": null, "vintage": "2018", "style": "Red"}`;

Deno.serve(async (req) => {
  try {
    const { base64Image } = await req.json();

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64Image } },
          { type: 'text', text: LABEL_SCAN_PROMPT },
        ],
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`No JSON found in response: ${text.slice(0, 200)}`);

    const parsed = JSON.parse(match[0]);
    return new Response(JSON.stringify({
      producer: parsed.producer ?? null,
      region: parsed.region ?? null,
      wineName: parsed.wineName ?? null,
      vintage: parsed.vintage ?? null,
      style: parsed.style ?? null,
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('scan-label error:', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
