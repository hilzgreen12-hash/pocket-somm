// Wine disambiguation candidates — "which wine is this?" after a weak scan.
//
// GROUNDED-FIRST: we look the producer up in the real wines_catalog and offer
// those actual bottlings. Only when the catalog has nothing for that producer do
// we fall back to the LLM (which can mis-remember a range). This stops invented
// cuvées (e.g. a fake "Le Roteboeuf" for Roc de Cambes) from ever being offered.
//
// Producer is treated as reliable (it reads consistently off a label); the
// ambiguity is in the specific bottling/cuvée.

import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

interface Candidate {
  wineName: string;
  region: string | null;
  style: string | null;
}

// Generic winery-type words dropped from the producer before the catalog search,
// so "Château Roc de Cambes" / "Kellerei Cantina Terlan" still match the stored
// producer. (search_wines_catalog is token-AND, so an extra "Château" would
// otherwise exclude every real row.)
const WINERY_WORDS = new Set([
  'chateau', 'château', 'domaine', 'domaines', 'weingut', 'kellerei', 'cantina', 'cantine',
  'bodega', 'bodegas', 'tenuta', 'tenute', 'azienda', 'maison', 'estate', 'winery',
  'vineyard', 'vineyards', 'wines', 'wine', 'family', 'champagne',
]);

function producerQuery(producer: string): string {
  return producer
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t && !WINERY_WORDS.has(t))
    .join(' ')
    .trim() || producer.trim();
}

// Strip a leading repeat of the producer from a catalog wine_name, so the tile
// shows just the distinguishing cuvée.
function cuveeOnly(producer: string, wineName: string): string {
  const p = producer.trim().toLowerCase();
  const n = wineName.trim();
  if (p && n.toLowerCase().startsWith(p + ' ')) return n.slice(p.length).trim();
  return n;
}

Deno.serve(async (req) => {
  try {
    const { producer, region, wineName, vintage } = await req.json().catch(() => ({}));
    if (!producer || !String(producer).trim()) return json({ candidates: [] }, 200);

    // 1) GROUNDED: real bottlings for this producer from the catalog.
    try {
      const q = producerQuery(String(producer));
      const { data: rows } = await db.rpc('search_wines_catalog', { q, lim: 12 });
      if (Array.isArray(rows) && rows.length) {
        const seen = new Set<string>();
        const grounded: Candidate[] = [];
        for (const r of rows as any[]) {
          const name = cuveeOnly(String(r.producer ?? ''), String(r.wine_name ?? '')).trim();
          const key = name.toLowerCase();
          if (!name || seen.has(key)) continue;
          seen.add(key);
          grounded.push({ wineName: name, region: r.region ?? null, style: r.style ?? null });
          if (grounded.length >= 8) break;
        }
        if (grounded.length) return json({ candidates: grounded, source: 'catalog' }, 200);
      }
    } catch (_e) { /* fall through to the LLM */ }

    // 2) FALLBACK: LLM, only when the catalog knows nothing of this producer.
    const prompt = `A wine label was scanned and identified as:
- Producer: "${producer ?? ''}"
- Region: "${region ?? ''}"
- Wine name / cuvée: "${wineName ?? ''}"
- Vintage: "${vintage ?? ''}"

If the producer text is a misspelling/OCR misread, silently correct it to the real producer. Then list the REAL, DISTINCT wines that producer makes that could match the label (up to 8), most likely first. If a region/cuvée was clearly read, list ONLY bottlings matching it.

ACCURACY IS CRITICAL — a wrong list is worse than a short one:
- NEVER invent a bottling. Only real wines this producer genuinely makes. If unsure, return FEWER.
- One entry per distinct wine (don't split one wine across near-identical names).
- For Bordeaux, give the appellation (+ cru only if real) then "Bordeaux", no "France"; for Burgundy give appellation/sub/cru then "Burgundy", no "France".

Return ONLY a JSON array (no markdown) of objects with keys:
- "wineName": ONLY the distinguishing cuvée/bottling name, never repeating the producer
- "region": the wine's region/appellation, or null
- "style": one of "Red", "White", "Rosé", "Sparkling", "Fortified", or null`;

    const resp = await client.messages.create({
      model: 'claude-sonnet-5-5',
      thinking: { type: 'between_tools' },
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = (resp.content.find((b) => b.type === 'text') as { text?: string } | undefined)?.text ?? '';
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

    return json({ candidates, source: 'llm' }, 200);
  } catch (err) {
    console.error('wine-candidates error:', err instanceof Error ? err.message : String(err));
    return json({ candidates: [] }, 200);
  }
});

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
}
