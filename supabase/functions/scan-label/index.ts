import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

const LABEL_SCAN_PROMPT = `You are a wine expert analyzing a wine label photograph. Extract the following information from this label:

1. producer: The winery, estate, family, or maker — the entity that produced the wine. The producer is the SAME across every bottle that maker releases. For example: "Mullineux" produces Schist, Iron, and Granite cuvées; "Penfolds" produces Grange, Bin 28, etc.; "Domaine de la Romanée-Conti" produces La Tâche, Romanée-Conti, etc. The producer is usually a family/estate name, château, domaine, or recognisable winery brand and is often printed prominently as the maker's signature. Use your knowledge of the wine world — if you recognise the maker, that is the producer.

2. region: The wine region, appellation, or country of origin (e.g. "Margaux, Bordeaux", "Swartland, South Africa").

3. wineName: The specific cuvée, vineyard, or bottling name — what distinguishes this bottle from OTHER bottles by the same producer (e.g. "Schist", "Grange", "La Tâche", "Le Montrachet"). This is often a single word, a place name, or a named blend. Set to null only when the bottle has no specific cuvée name and is sold simply under the producer's name.

   DISAMBIGUATION RULE: if you see two prominent names on the label, the producer is the maker's brand (often appears in a signature, logo, or as the legal/contact name) and the wine name is the specific cuvée label (often a single word or a vineyard/blend name). Do NOT swap them. If unsure, prefer the more well-known/recognisable name as the producer.

4. vintage: The vintage year as a 4-digit string (e.g. "2019"), "NV" if the label explicitly states non-vintage, or null if no vintage information is visible.

5. style: One of "Red", "White", "Rosé", "Sparkling", or "Fortified". This is NOT optional — every wine has a style. If the label doesn't visually state it, infer from the producer, region, appellation, or wine name. Champagne and other traditional-method sparkling wines are "Sparkling". Port, Madeira, Sherry are "Fortified". Use your best judgement; do not return null.

Return ONLY a valid JSON object with exactly these five keys. Set any field other than style to null if you cannot confidently identify it from the label. Do not include any explanation or markdown — only the raw JSON.

Example: {"producer": "Mullineux", "region": "Swartland, South Africa", "wineName": "Schist", "vintage": "2019", "style": "Red"}`;

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
