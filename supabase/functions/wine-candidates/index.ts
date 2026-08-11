// Wine disambiguation candidates.
//
// When a scanned label is identified weakly (Wine Intel came back with no
// critic score and no market price — a strong sign the identity was off, e.g. a
// cuvée name missed on the label), the app auto-surfaces a "which wine is this?"
// list. This function asks Claude — which knows producers' ranges — for the
// real, distinct wines that producer makes that could match the label, so the
// user can confirm the exact one and intel regenerates for it.
//
// Producer is treated as reliable (it reads consistently off a label); the
// ambiguity is in the specific bottling/cuvée.

import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

interface Candidate {
  wineName: string;   // full distinguishing bottling/cuvée name
  region: string | null;
  style: string | null;
}

Deno.serve(async (req) => {
  try {
    const { producer, region, wineName, vintage } = await req.json().catch(() => ({}));
    if (!producer || !String(producer).trim()) {
      return json({ candidates: [] }, 200);
    }

    const prompt = `A wine label was scanned and identified as:
- Producer: "${producer ?? ''}"
- Region: "${region ?? ''}"
- Wine name / cuvée: "${wineName ?? ''}"
- Vintage: "${vintage ?? ''}"

First, if the producer text is misspelt or an OCR misread, silently correct it to the real producer you recognise (e.g. "Pazo Senorans" → Pazo de Señorans). Then list THIS producer's core range so the user can pick the right bottling — the specific cuvée may have been missed or misread on the label.

List the REAL, DISTINCT wines that this producer actually makes — be THOROUGH and include their whole core range (up to 8), not just the obvious one. Most estates make several bottlings; a well-known producer's full range is easy to recall (e.g. Pazo de Señorans makes Albariño, Selección de Añada, Rosal, Blanco de Blancos, and more). Order by how likely each is given the partial reading. Do NOT invent wines — only real bottlings this producer is known to make. Do not repeat the same wine.

Return ONLY a JSON array (no markdown, no prose) of objects with exactly these keys:
- "wineName": ONLY the distinguishing cuvée/bottling name — NEVER repeat the producer's name in it (e.g. for Pazo de Señorans return "Rosal", not "Pazo de Señorans Rosal"; return "Grange", "Bin 707 Cabernet Sauvignon", "Cuvée Sir Winston Churchill"). For a flagship wine sold simply under the producer's own name, use its grape or appellation as the name (e.g. "Albariño")
- "region": the wine's region/appellation, or null
- "style": one of "Red", "White", "Rosé", "Sparkling", "Fortified", or null`;

    const resp = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 900,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = resp.content[0]?.type === 'text' ? resp.content[0].text : '';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) return json({ candidates: [] }, 200);

    let parsed: any[];
    try { parsed = JSON.parse(match[0]); } catch { return json({ candidates: [] }, 200); }

    const candidates: Candidate[] = (Array.isArray(parsed) ? parsed : [])
      .map((c) => ({
        wineName: typeof c?.wineName === 'string' ? c.wineName.trim() : '',
        region: typeof c?.region === 'string' && c.region.trim() ? c.region.trim() : null,
        style: typeof c?.style === 'string' && c.style.trim() ? c.style.trim() : null,
      }))
      .filter((c) => c.wineName)
      .slice(0, 8);

    return json({ candidates }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('wine-candidates error:', message);
    return json({ candidates: [] }, 200);
  }
});

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
