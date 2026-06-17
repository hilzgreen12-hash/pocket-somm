import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

// Read a recipe (screenshot or photo) so Find a Wine Pairing can base its
// recommendation on the actual dish — returns a concise dish name plus a
// pairing-relevant summary of the key ingredients, method and flavours.
Deno.serve(async (req) => {
  try {
    const { base64Image } = await req.json();

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64Image } },
            {
              type: 'text',
              text: `This image is a recipe — a screenshot from a website/app or a photo of a recipe card or page. Read it and return:
- dishName: a concise dish title (e.g. "Coq au Vin", "Miso-Glazed Salmon"), as written if present, else a short descriptive name.
- summary: 1–2 sentences capturing the parts that matter for WINE PAIRING — the main protein/base, dominant flavours (rich, spicy, acidic, sweet, smoky…), key sauces/ingredients and cooking method.

Return ONLY valid JSON: { "dishName": "...", "summary": "..." }
If it isn't a recipe, return { "dishName": null, "summary": null }. Raw JSON only — no markdown, no explanation.`,
            },
          ],
        },
      ],
    });

    const text = response.content.find((b) => b.type === 'text')?.text ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`No JSON found: ${text.slice(0, 200)}`);
    const parsed = JSON.parse(match[0]);
    return new Response(JSON.stringify(parsed), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('scan-recipe error:', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
