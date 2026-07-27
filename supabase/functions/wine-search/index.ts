// Predictive wine search (typeahead for manual entry).
//
// The manual "Add a Wine" flow lets the user type into a single search box; as
// they type, this returns a shortlist of real wines that match, each with clean,
// consistently-formatted producer / cuvée / region / style. The user picks one,
// which fills the identity fields — faster, better-formatted, and more accurate
// than free-typing. Claude-backed (no public wine typeahead API exists); the
// chosen wine is still verified against Wine-Searcher when intel is generated.

import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

interface Result {
  producer: string;
  wineName: string | null;
  region: string | null;
  style: string | null;
}

Deno.serve(async (req) => {
  try {
    const { query } = await req.json().catch(() => ({}));
    const q = typeof query === 'string' ? query.trim() : '';
    if (q.length < 3) return json({ results: [] }, 200);

    const prompt = `A user is searching for a wine to add to their cellar. Their partial search text is: "${q}".

Return up to 8 REAL wines that best match this text, ordered most-likely first, as they would appear in a wine database. Prefer recognisable producers and their known bottlings. Use correct, consistent formatting and capitalisation (e.g. "Château Margaux", not "chateau margaux"). Do NOT invent wines — only real ones. If the text is too vague to match anything real, return an empty array.

Return ONLY a JSON array (no markdown, no prose) of objects with exactly these keys:
- "producer": the winery / estate / producer (e.g. "Penfolds")
- "wineName": the specific cuvée / bottling name (e.g. "Grange", "Bin 707 Cabernet Sauvignon"), or null if the wine is sold simply under the producer name
- "region": the wine's region / appellation (e.g. "Barossa Valley, South Australia"), or null
- "style": one of "Red", "White", "Rosé", "Sparkling", "Fortified", or null`;

    const resp = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = resp.content[0]?.type === 'text' ? resp.content[0].text : '';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) return json({ results: [] }, 200);

    let parsed: any[];
    try { parsed = JSON.parse(match[0]); } catch { return json({ results: [] }, 200); }

    const results: Result[] = (Array.isArray(parsed) ? parsed : [])
      .map((r) => ({
        producer: typeof r?.producer === 'string' ? r.producer.trim() : '',
        wineName: typeof r?.wineName === 'string' && r.wineName.trim() ? r.wineName.trim() : null,
        region: typeof r?.region === 'string' && r.region.trim() ? r.region.trim() : null,
        style: typeof r?.style === 'string' && r.style.trim() ? r.style.trim() : null,
      }))
      .filter((r) => r.producer)
      .slice(0, 8);

    return json({ results }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('wine-search error:', message);
    return json({ results: [] }, 200);
  }
});

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
