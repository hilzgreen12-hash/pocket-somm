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
import { createClient } from 'npm:@supabase/supabase-js';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

// Cache the generated lineup by (producer + wine) so the SAME wine's intel card
// returns the identical range every time (the LLM is non-deterministic, which
// made the range change on each re-open). Service-role client bypasses RLS.
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const cacheKeyOf = (producer: string, wineName: string) =>
  `${producer}|${wineName}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

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

    // Cache hit → return the exact same range as last time (deterministic).
    const cacheKey = cacheKeyOf(String(producer), String(wineName ?? ''));
    try {
      const { data: cached } = await admin.from('producer_range_cache').select('response').eq('cache_key', cacheKey).maybeSingle();
      if (cached?.response) return json(cached.response, 200);
    } catch (e) { console.warn('[producer-range] cache read failed (continuing):', e); }

    // Catalog-first: pull this producer's REAL cuvées from Vinster's own
    // wines_catalog (thousands of seeded bottlings) and hand them to Claude as
    // the authoritative set to order/band/summarise — so the range is grounded
    // in Vinster's database, not just the model's recall. Keep only the
    // best-matching producer variant(s) so a different producer sharing a word
    // (e.g. "Domaine Dutraive" vs "Domaine Leflaive") doesn't leak in.
    let catalogBlock = '';
    try {
      const { data: rows } = await admin.rpc('catalog_producer_wines', { p: String(producer), lim: 40 });
      if (Array.isArray(rows) && rows.length) {
        const topSim = Number(rows[0].sim) || 0;
        const cutoff = Math.max(0.4, topSim - 0.15);
        const kept = rows.filter((r: any) => (Number(r.sim) || 0) >= cutoff);
        const lines = Array.from(new Set(
          kept.map((r: any) => `- ${r.producer} — ${r.wine_name}`),
        )).slice(0, 40);
        if (lines.length >= 2) {
          catalogBlock = `\n\nVinster's catalogue lists these REAL wines for this producer — treat them as the AUTHORITATIVE set: use these exact wines (merging obvious variant spellings of the SAME wine, e.g. "Domaine Georges Roumier" and "Georges Roumier"), and do NOT invent others beyond this list. Only use entries whose producer matches the scanned producer; ignore any that clearly belong to a different producer. You MAY add the scanned wine if it's genuinely missing.\n${lines.join('\n')}`;
        }
      }
    } catch (e) { console.warn('[producer-range] catalog lookup failed (continuing):', e); }

    const prompt = `A wine label was scanned and identified as:
- Producer: "${producer ?? ''}"
- Region: "${region ?? ''}"
- Wine name / cuvée: "${wineName ?? ''}"
- Vintage: "${vintage ?? ''}"
${catalogBlock}

If the producer text is misspelt or an OCR misread, silently correct it to the real producer you recognise (e.g. "Pazo Senorans" → Pazo de Señorans). Then give that producer's core range so the user can see WHERE this wine sits within it.

List the REAL, DISTINCT wines this producer is known to make — be THOROUGH and include their WHOLE core range (up to 8), from entry level to flagship, not just the scanned one. Even when the scanned wine is a specific or prestige bottling, you MUST still list the producer's OTHER core wines — above all their standard / entry bottling. A well-known estate's core lineup is easy to recall (e.g. Pazo de Señoráns makes the standard Albariño AND the aged Selección de Añada, plus the sweet Sol de Señoráns; Krug makes Grande Cuvée, Rosé, Vintage, Clos du Mesnil, Clos d'Ambonnay, Collection). Order them STRICTLY by real-world PRESTIGE / price, entry-level first, the rarest/most-expensive flagship last.

ACCURACY IS CRITICAL — a wrong lineup is worse than a short one:
- SAME ESTATE ONLY: list ONLY wines made by THIS exact château / domaine / estate. Do NOT pull in wines from a SIBLING or affiliated estate under the same ownership group, even when the names are similar or they share an appellation — that is a serious, common error. Example: Château Haut-Brion's range is its red Grand Vin, Le Clarence de Haut-Brion (second red), Château Haut-Brion Blanc, and La Clarté de Haut-Brion (second white). It must NOT include Château La Mission Haut-Brion or its white "Laville Haut-Brion" — those belong to a DIFFERENT château (same owner, Domaine Clarence Dillon, but a separate estate). Likewise never merge a négociant's or group's other brands into one estate's range.
- Do NOT invent bottlings. Only real wines this producer actually makes.
- Do NOT list the same wine under several near-identical names (e.g. never "Clos d'Ambonnay", "Clos d'Ambonnay Brut" and "Clos d'Ambonnay Vintage" — that is ONE wine). One entry per distinct wine.
- Get the ORDER right: a producer's rare single-vineyard / prestige cuvée belongs at the TOP (band 5), never at entry level (e.g. Krug's Clos d'Ambonnay and Clos du Mesnil are their most prestigious, NOT entry).
- If you are unsure of an OBSCURE bottling, leave it out rather than guessing — but "fewer" means no invented guesses, it does NOT mean dropping the producer's well-known core wines (their standard / entry bottling above all).
- MINIMUM RANGE: for any producer who makes more than one wine — which is almost all of them — the list MUST contain at least their standard / entry wine AND the scanned wine. A single-item list that contains only the scanned wine is a FAILURE unless the producer genuinely makes just that one wine. (Pazo de Señoráns, for example, must never come back as only "Selección de Añada" — the standard Albariño belongs there too.)

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
      // Sonnet, not Haiku: producer-range needs real, accurate lineup knowledge —
      // Haiku fabricated and misranked bottlings (e.g. inventing "Clos d'Ambonnay"
      // variants and ranking Krug's flagship as entry level).
      model: 'claude-sonnet-4-6',
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

    const result = { wines, summary };
    // Cache it so this wine's range is stable on every future open. Only cache a
    // non-empty result — an empty/failed generation should be retried next time.
    if (wines.length > 0) {
      try { await admin.from('producer_range_cache').upsert({ cache_key: cacheKey, response: result }); }
      catch (e) { console.warn('[producer-range] cache write failed:', e); }
    }
    return json(result, 200);
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
