import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

const WINE_FIELDS = `For each wine return a JSON object with these fields:
- name: the wine name (string)
- producer: producer or domaine (string)
- region: broad region e.g. "Burgundy", "Bordeaux", "Napa Valley" (string)
- appellation: specific appellation e.g. "Puligny-Montrachet", "Pauillac" (string, optional)
- grape: grape variety or blend e.g. "Chardonnay", "Cabernet Sauvignon/Merlot" (string, optional)
- vintage: 4-digit year as integer, or null if non-vintage (number | null)
- menuPrice: numeric price as listed on the menu, null if not shown (number | null)
- currency: 3-letter currency code, default "GBP" (string)

IMPORTANT: Return ONLY raw valid JSON — no markdown, no code blocks, no backticks, no explanation.
Use this exact format:
{ "wines": [ ...wine objects... ] }

If you cannot identify any wines, return: { "wines": [] }`;

const IMAGE_SYSTEM_PROMPT = `You are a wine list parser. Extract every wine from the provided image of a restaurant wine list.\n\n${WINE_FIELDS}`;

const URL_SYSTEM_PROMPT = `You are a wine list parser. Extract every wine from the provided text of a restaurant wine list.\n\n${WINE_FIELDS}`;

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { imageBase64, url } = body;

    if (!imageBase64 && !url) {
      return new Response(JSON.stringify({ error: 'imageBase64 or url required' }), { status: 400 });
    }

    let response;

    if (url) {
      // Fetch and strip the webpage
      const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!pageRes.ok) throw new Error(`Failed to fetch URL: ${pageRes.status}`);
      const html = await pageRes.text();
      const pageText = stripHtml(html).slice(0, 12000); // cap to avoid token overflow

      response = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 8096,
        system: URL_SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: `Extract all wines from this wine list text. Return only JSON.\n\n${pageText}` },
        ],
      });
    } else {
      response = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 8096,
        system: IMAGE_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 },
              },
              { type: 'text', text: 'Extract all wines from this wine list. Return only JSON.' },
            ],
          },
        ],
      });
    }

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract JSON object from response regardless of surrounding text
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`No JSON found in response: ${text.slice(0, 200)}`);
    const parsed = JSON.parse(match[0]);

    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('OCR function error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
