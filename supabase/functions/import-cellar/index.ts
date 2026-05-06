import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

Deno.serve(async (req) => {
  try {
    const { base64Image } = await req.json();

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: base64Image },
            },
            {
              type: 'text',
              text: `You are a wine cellar assistant. This image shows a cellar-related document — it could be a spreadsheet, a printed inventory list, handwritten notes, a wine merchant's receipt, an invoice from a wholesaler or retailer, or a screenshot of any of these. Be tolerant of formatting and ignore non-wine items (e.g. delivery fees, gift bags, taxes).

Extract every wine entry you can identify. For each wine, extract:
- wine_name: the wine name (e.g. "Château Margaux", "Barolo", "Chablis Premier Cru")
- producer: the producer or château name (may be the same as wine_name if not separate)
- region: the region or appellation (e.g. "Bordeaux", "Burgundy", "Barossa Valley")
- vintage: the year as a string (e.g. "2018"), or null if not shown
- quantity: number of bottles as an integer (default 1 if not specified — typical for receipts where quantity is listed in a column)
- purchase_price: per-bottle price as a number if shown on the document (receipts and invoices usually show this), or null. If the document shows a line-total (price × quantity), divide to get the per-bottle price. Strip currency symbols.
- currency: ISO 4217 code if you can determine it from the document (£→GBP, $→USD, €→EUR, etc.), or null.

Return ONLY valid JSON with this structure:
{
  "wines": [
    {
      "wine_name": "...",
      "producer": "...",
      "region": "...",
      "vintage": "...",
      "quantity": 1,
      "purchase_price": 45.00,
      "currency": "GBP"
    }
  ]
}

If you cannot identify any wines, return { "wines": [] }.
Return raw JSON only. No markdown. No explanation.`,
            },
          ],
        },
      ],
    });

    const text = response.content.find((b) => b.type === 'text')?.text ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`No JSON found: ${text.slice(0, 200)}`);

    const parsed = JSON.parse(match[0]);
    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('import-cellar error:', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
