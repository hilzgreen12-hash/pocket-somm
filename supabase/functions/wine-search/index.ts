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

The search text may contain SPELLING MISTAKES or OCR misreads (it can come from a scanned label). Correct obvious misspellings to the real wine the user most likely means, the way a wine merchant's search would — do not take the typo literally. Examples:
- "Droil Chablis" → Domaine Droin, i.e. "Jean-Paul & Benoît Droin", Chablis (the "l" is a misread "n")
- "Chateau Margeaux" → "Château Margaux"
- "Penfols Grange" → "Penfolds", "Grange"

The search text may be the PRODUCER, but very often it is a CUVÉE, a single-vineyard name, or a wine/bottling name — NOT the producer. Your job is to resolve each match to its REAL producer.

CRITICAL — the "producer" field must always be the actual winery / estate that MAKES the wine, never an echo of the user's text when that text is really a cuvée or vineyard. Words like "Tenuta"/"Tenute", "Clos", "Château", "Domaine", "Quinta", "Weingut" can be part of a CUVÉE or single-vineyard name rather than the estate name — do not assume the typed words are the producer. Resolve the true producer and put the cuvée in "wineName".
Worked examples:
- "Tenuta Nuova" → producer "Casanova di Neri", wineName "Brunello di Montalcino Tenuta Nuova" (Tenuta Nuova is Casanova di Neri's cru — NOT a producer)
- "Sassicaia" → producer "Tenuta San Guido", wineName "Sassicaia"
- "Cristal" → producer "Louis Roederer", wineName "Cristal"
- "Bin 707" → producer "Penfolds", wineName "Bin 707 Cabernet Sauvignon"
If you genuinely cannot resolve the real producer for a match, still give your best real identification of the producer rather than repeating the search text as the producer; if nothing real matches at all, omit it.

Return up to 8 REAL wines that best match this text, ordered most-likely first, as they would appear in a wine database. Prefer recognisable producers and their known bottlings. Use correct, consistent formatting and capitalisation (e.g. "Château Margaux", not "chateau margaux"). Do NOT invent wines — only real ones. If the text is too vague to match anything real, return an empty array.

Return ONLY a JSON array (no markdown, no prose) of objects with exactly these keys:
- "producer": the winery / estate / producer that actually makes the wine (e.g. "Penfolds", "Casanova di Neri") — NEVER a cuvée or vineyard name
- "wineName": the specific cuvée / bottling name (e.g. "Grange", "Bin 707 Cabernet Sauvignon", "Brunello di Montalcino Tenuta Nuova"), or null if the wine is sold simply under the producer name
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
