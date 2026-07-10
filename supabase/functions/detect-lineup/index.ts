import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

// "Archive a Night" — identify each bottle in a photo of a 1–8 bottle lineup
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
              text: `This photo shows a lineup of wine bottles (usually 1–8) that someone has just drunk and wants to remove from their cellar. Identify EACH bottle you can read.

The photo may be rotated or upside down (bottles are often stored neck-forward in a rack, so a straight photo of the rack comes out inverted). Read every label regardless of its orientation, and never skip a bottle just because its label is rotated.

For each bottle return:
- producer: the producer / château / domaine (may equal wine_name if not separate)
- wineName: the wine or cuvée name (e.g. "Barolo Albe", "Château Margaux")
- vintage: the 4-digit year as a string if legible, else null
- region: the region or appellation if you can read or confidently infer it (e.g. "Barolo", "Bordeaux"), else null
- confident: true only if you can read the label clearly; false if it's a guess from a blurry/partial/angled label
- box: the bounding box of THIS bottle's FRONT LABEL — the printed paper label you read the name from, NOT the whole bottle, and NOT the neck, capsule or background. Give it as fractions of the FULL image: { "x": label's left edge, "y": label's top edge, "w": label width, "h": label height }, each between 0 and 1, where (0,0) is the top-left of the photo and (1,1) the bottom-right. Center the box tightly on the label. The bottles stand in a horizontal row, so each label sits in its own vertical band: order them left to right, make box.x INCREASE with each bottle, and do NOT let adjacent boxes overlap. A front label is usually in the lower-middle of the bottle and far shorter than the bottle (typical h ≈ 0.2–0.35, not 0.8). Always provide a box.

Return the bottles LEFT TO RIGHT as they stand in the photo. Return ONE object per physical bottle — if the same wine appears twice, return it twice. Do NOT invent bottles you cannot see, and do NOT pad the list. If a label is unreadable, still include the bottle with whatever you can read and confident:false.

Return ONLY valid JSON (example shows the 2nd of three evenly-spaced bottles):
{ "bottles": [ { "producer": "...", "wineName": "...", "vintage": "2019", "region": "Pomerol", "confident": true, "box": { "x": 0.37, "y": 0.46, "w": 0.18, "h": 0.28 } } ] }

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
