// Producer range — "where does this wine sit in the producer's lineup?"
//
// Most wine apps stop at the single bottle. This surfaces the wider context a
// sommelier would give: the producer's real range, ordered by prestige, with a
// relative price band per wine, the scanned bottle flagged, and a one-line note
// placing it in the range. Claude carries producers' lineups; we ask it for the
// real, distinct wines this producer makes and where the scanned one sits.
//
// Bands are RELATIVE (1–5) within this producer's own range — not absolute
// prices — so the client renders a clean price/prestige ladder in the user's
// currency symbol without N live market lookups.

import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

interface RangeWine {
  wineName: string;
  band: number;         // 1 (entry) … 5 (flagship), relative within this producer
  tier: string | null;  // short word: Entry / Estate / Premium / Flagship, etc.
  isThis: boolean;      // the scanned wine
}

Deno.serve(async (req) => {
  try {
    const { producer, region, wineName, vintage } = await req.json().catch(() => ({}));
    if (!producer || !String(producer).trim()) {
      return json({ wines: [], summary: null }, 200);
    }

    const prompt = `A wine label was scanned and identified as:
- Producer: "${producer ?? ''}"
- Region: "${region ?? ''}"
- Wine name / cuvée: "${wineName ?? ''}"
- Vintage: "${vintage ?? ''}"

If the producer text is misspelt or an OCR misread, silently correct it to the real producer you recognise (e.g. "Pazo Senorans" → Pazo de Señorans). Then give that producer's core range so the user can see WHERE this wine sits within it.

List the REAL, DISTINCT wines this producer is known to make — be THOROUGH and include their WHOLE core range (up to 8), from entry level to flagship, not just the obvious few. A well-known estate's full lineup is easy to recall (e.g. Pazo de Señorans makes Albariño, Selección de Añada, Rosal, Blanco de Blancos, Con Carácter). Order them by PRESTIGE / price, lowest first, flagship last. Do NOT invent wines; only real bottlings this producer actually makes. Do not repeat the same wine.

You MUST include the scanned wine itself in the list (set "isThis": true on exactly one entry — the one matching "${wineName || producer}"). If the scanned cuvée isn't among the producer's well-known wines, still place it at its approximate prestige level and flag it.

Each "wineName" must be ONLY the distinguishing cuvée/bottling name — NEVER repeat the producer's name in it (e.g. "Rosal", not "Pazo de Señorans Rosal"). For a flagship sold simply under the producer's own name, use its grape or appellation.

For each wine give a relative price band from 1 to 5 WITHIN THIS PRODUCER'S OWN RANGE (1 = their entry level, 5 = their flagship) — a relative ladder, not an absolute price. Also give a short tier word.

Return ONLY a JSON object (no markdown, no prose) with exactly these keys:
{
  "wines": [
    { "wineName": "<full distinguishing bottling name>", "band": <integer 1-5>, "tier": "<Entry|Estate|Classic|Premium|Prestige|Flagship or similar single word>", "isThis": <true|false> }
  ],
  "summary": "<ONE short sentence — 25 words max — placing the scanned wine in the producer's range, e.g. 'Bin 707 sits near the top of Penfolds' range, one tier below the flagship Grange.'>"
}

If you cannot confidently identify the producer's range, return {"wines": [], "summary": null}.`;

    const resp = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 900,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = resp.content[0]?.type === 'text' ? resp.content[0].text : '';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return json({ wines: [], summary: null }, 200);

    let parsed: any;
    try { parsed = JSON.parse(match[0]); } catch { return json({ wines: [], summary: null }, 200); }

    const rawWines = Array.isArray(parsed?.wines) ? parsed.wines : [];
    const wines: RangeWine[] = rawWines
      .map((w: any) => ({
        wineName: typeof w?.wineName === 'string' ? w.wineName.trim() : '',
        band: clampBand(w?.band),
        tier: typeof w?.tier === 'string' && w.tier.trim() ? w.tier.trim() : null,
        isThis: w?.isThis === true,
      }))
      .filter((w: RangeWine) => w.wineName)
      .slice(0, 8);

    // Guarantee exactly one flagged wine: if Claude flagged none (or several),
    // keep the first flag and clear the rest; if none, leave unflagged rather
    // than guessing — the client simply renders the ladder without a highlight.
    let seenThis = false;
    for (const w of wines) {
      if (w.isThis && !seenThis) { seenThis = true; continue; }
      w.isThis = false;
    }

    const summary = typeof parsed?.summary === 'string' && parsed.summary.trim()
      ? parsed.summary.trim()
      : null;

    return json({ wines, summary }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('producer-range error:', message);
    return json({ wines: [], summary: null }, 200);
  }
});

// Coerce band to an integer in [1, 5]; default the middle when unparseable.
function clampBand(v: unknown): number {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return 3;
  return Math.max(1, Math.min(5, n));
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
