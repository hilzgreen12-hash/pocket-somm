import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

// "Archive a Night" — identify each bottle in a photo of a 1–8 bottle lineup
// so they can be matched against the cellar and bulk-archived. One entry per
// physical bottle (duplicates are aggregated client-side after matching).
Deno.serve(async (req) => {
  try {
    const { base64Image, stream } = await req.json();

    // The single Claude round-trip for this detect. Extracted so the buffered
    // and streamed paths run the identical read + JSON extraction.
    async function run(): Promise<any> {
      const response = await client.messages.create({
      model: 'claude-sonnet-5-5',
      thinking: { type: 'between_tools' },
      max_tokens: 8000,
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
- region: the FULL origin, consistently formatted — appellation/sub-region, then broader region, then country (e.g. "Barbaresco, Piedmont, Italy", "Pomerol, Bordeaux", "Barossa Valley, South Australia, Australia"). For BORDEAUX and BURGUNDY wines give the appellation (+ cru only if printed) then "Bordeaux"/"Burgundy" and NEVER append "France" (e.g. "Pauillac, Bordeaux", "Chablis, Burgundy"); every other region KEEPS its country. "Brunello di Montalcino", "Brunello di Montalcino Riserva" and "Rosso di Montalcino" are WINE NAMES, not regions — put them in wineName and set region to "Montalcino, Tuscany, Italy". Infer it from the producer/appellation when not printed; null only if you genuinely can't place it.
- grape: the primary grape variety — read it off the label, or infer from the appellation when it's effectively single-grape (Barolo/Barbaresco → Nebbiolo, Chablis → Chardonnay, Sancerre → Sauvignon Blanc, Rioja → Tempranillo, etc.). For a blend give the primary or a short blend. null only if you truly cannot tell.
- style: the wine's colour / style if you can tell from the label, glass or liquid — one of "Red", "White", "Rosé", "Sparkling", "Orange", "Fortified", "Dessert" — else null
- confident: true only if you can read the label clearly; false if it's a guess from a blurry/partial/angled label
- box: the bounding box of THIS bottle's FRONT LABEL — the printed paper label you read the name from, NOT the whole bottle, and NOT the neck, capsule or background. Give it as fractions of the FULL image: { "x": label's left edge, "y": label's top edge, "w": label width, "h": label height }, each between 0 and 1, where (0,0) is the top-left of the photo and (1,1) the bottom-right. Center the box tightly on the label. The bottles stand in a horizontal row, so each label sits in its own vertical band: order them left to right, make box.x INCREASE with each bottle, and do NOT let adjacent boxes overlap. A front label is usually in the lower-middle of the bottle and far shorter than the bottle (typical h ≈ 0.2–0.35, not 0.8). Always provide a box.

Return the bottles LEFT TO RIGHT as they stand in the photo. Return ONE object per physical bottle — if the same wine appears twice, return it twice. Do NOT invent bottles you cannot see, and do NOT pad the list. If a label is unreadable, still include the bottle with whatever you can read and confident:false.

Return ONLY valid JSON (example shows the 2nd of three evenly-spaced bottles):
{ "bottles": [ { "producer": "...", "wineName": "...", "vintage": "2019", "region": "Pomerol, Bordeaux", "grape": "Merlot", "style": "Red", "confident": true, "box": { "x": 0.37, "y": 0.46, "w": 0.18, "h": 0.28 } } ] }

If you can't identify any bottles, return { "bottles": [] }. Raw JSON only — no markdown, no explanation.`,
            },
          ],
        },
      ],
    });

      const text = response.content.find((b) => b.type === 'text')?.text ?? '';
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error(`No JSON found: ${text.slice(0, 200)}`);
      return JSON.parse(match[0]);
    }

    // Buffered path (stream !== true): unchanged single-JSON response. Kept as
    // the fallback the current app build uses when streaming isn't available.
    if (stream !== true) {
      const parsed = await run();
      return new Response(JSON.stringify(parsed), { headers: { 'Content-Type': 'application/json' } });
    }

    // Streamed path: identifying a full lineup can run long enough for a mobile
    // connection to be severed mid-flight. Keep the connection alive with an SSE
    // heartbeat every few seconds, then emit one final `data:` frame with the
    // same { bottles } object the buffered path returns (or an error). Mirrors ocr.
    const encoder = new TextEncoder();
    const streamBody = new ReadableStream({
      async start(controller) {
        const send = (s: string) => {
          try { controller.enqueue(encoder.encode(s)); } catch { /* closed */ }
        };
        send(': open\n\n');
        const heartbeat = setInterval(() => send(': ping\n\n'), 8000);
        try {
          const parsed = await run();
          send(`data: ${JSON.stringify(parsed)}\n\n`);
        } catch (err) {
          console.error('detect-lineup stream error:', err instanceof Error ? err.message : String(err));
          send(`data: ${JSON.stringify({ error: 'Something went wrong. Please try again.' })}\n\n`);
        } finally {
          clearInterval(heartbeat);
          controller.close();
        }
      },
    });
    return new Response(streamBody, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('detect-lineup error:', message);
    // Logged above with full detail. The client gets a generic message:
    // raw exception text can carry Anthropic SDK request/response detail or
    // echo back model output on a JSON parse failure.
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
