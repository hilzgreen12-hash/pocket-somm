import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

// "Archive a Night" — identify each bottle in a photo of a 1–10 bottle lineup
// so they can be matched against the cellar and bulk-archived. One entry per
// physical bottle (duplicates are aggregated client-side after matching).
Deno.serve(async (req) => {
  try {
    const { base64Image } = await req.json();

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64Image } },
            {
              type: 'text',
              text: `This photo shows a lineup of wine bottles (usually 1–10) that someone has just drunk and wants to remove from their cellar. Identify EACH bottle you can read.

For each bottle return:
- producer: the producer / château / domaine (may equal wine_name if not separate)
- wineName: the wine or cuvée name (e.g. "Barolo Albe", "Château Margaux")
- vintage: the 4-digit year as a string if legible, else null
- confident: true only if you can read the label clearly; false if it's a guess from a blurry/partial/angled label

Return ONE object per physical bottle — if the same wine appears twice, return it twice. Do NOT invent bottles you cannot see, and do NOT pad the list. If a label is unreadable, still include the bottle with whatever you can read and confident:false.

Return ONLY valid JSON:
{ "bottles": [ { "producer": "...", "wineName": "...", "vintage": "2019", "confident": true } ] }

If you can't identify any bottles, return { "bottles": [] }. Raw JSON only — no markdown, no explanation.`,
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
    console.error('detect-lineup error:', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
