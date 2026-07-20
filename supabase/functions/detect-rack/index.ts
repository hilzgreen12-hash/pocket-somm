import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

const DETECT_PROMPT = `You are analysing a photo of a wine rack or wine storage unit.

Count the number of rows (horizontal levels) and columns (vertical positions per row) in the rack.

Return ONLY a valid JSON object with exactly these keys:
- rows: integer number of horizontal rows
- cols: integer number of columns (bottle positions per row)

Be conservative — if you are unsure, round down rather than up. If the rack is not a standard rectangular grid (e.g. it is diamond-shaped or irregular), approximate the nearest rectangular grid that fits.

Example: {"rows": 6, "cols": 12}

Return raw JSON only. No explanation. No markdown.`;

Deno.serve(async (req) => {
  try {
    const { base64Image } = await req.json();

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 128,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64Image } },
          { type: 'text', text: DETECT_PROMPT },
        ],
      }],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`No JSON found: ${text.slice(0, 200)}`);

    const parsed = JSON.parse(match[0]);
    const rows = Math.max(1, Math.min(parseInt(parsed.rows) || 4, 30));
    const cols = Math.max(1, Math.min(parseInt(parsed.cols) || 4, 30));

    return new Response(JSON.stringify({ rows, cols }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('detect-rack error:', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
