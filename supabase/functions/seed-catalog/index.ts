// Seed / grow the local wine catalog (wines_catalog) used by the predictive
// "Search a Wine" typeahead. Given a category prompt, asks Claude for a batch of
// REAL, well-known wines and upserts them (deduped by a normalized key). Invoked
// server-side (service role) so writes bypass RLS. Driven in a loop over a
// category list to build the focused ~5–10k seed; safe to re-run (idempotent
// upserts).

import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

// Normalized dedup key: lowercase, strip accents/punctuation, collapse spaces.
function norm(s: string): string {
  return (s ?? '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

Deno.serve(async (req) => {
  try {
    const { category, count } = await req.json().catch(() => ({}));
    const cat = typeof category === 'string' ? category.trim() : '';
    const n = Math.min(Math.max(Number(count) || 150, 20), 200);
    if (!cat) return json({ error: 'category required' }, 400);

    const prompt = `List ${n} REAL, well-known wines in this category: ${cat}.

These populate a wine-search database, so accuracy matters. Rules:
- Only REAL wines from REAL producers. Never invent a wine or producer. If you run out of genuinely notable ones, return fewer — do not pad with fabrications.
- "producer" is the actual winery/estate that MAKES the wine — never a cuvée or vineyard name. E.g. Sassicaia → producer "Tenuta San Guido"; Cristal → producer "Louis Roederer"; Tenuta Nuova → producer "Casanova di Neri".
- "wineName" is the specific cuvée/bottling (e.g. "Grange", "Bin 707 Cabernet Sauvignon", "Sassicaia"), or null if the wine is sold simply under the producer name.
- Correct, consistent capitalisation and accents (e.g. "Château Margaux", "Domaine de la Romanée-Conti").
- Vintage-agnostic — do NOT include a year.

Return ONLY a JSON array (no markdown, no prose) of objects with exactly these keys:
- "producer": string
- "wineName": string or null
- "region": string or null (region/appellation, e.g. "Barossa Valley, South Australia")
- "grape": string or null (variety or blend, e.g. "Shiraz", "Cabernet Sauvignon/Merlot")
- "style": one of "Red","White","Rosé","Sparkling","Fortified", or null`;

    const resp = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = resp.content[0]?.type === 'text' ? resp.content[0].text : '';
    const match = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').match(/\[[\s\S]*\]/);
    if (!match) return json({ inserted: 0, parsed: 0, note: 'no JSON array' }, 200);

    let parsed: any[];
    try { parsed = JSON.parse(match[0]); } catch { return json({ inserted: 0, parsed: 0, note: 'bad JSON' }, 200); }

    const rows = (Array.isArray(parsed) ? parsed : [])
      .map((r) => {
        const producer = typeof r?.producer === 'string' ? r.producer.trim() : '';
        const wineName = typeof r?.wineName === 'string' && r.wineName.trim() ? r.wineName.trim() : null;
        if (!producer) return null;
        const key = wineName ? `${norm(producer)}|${norm(wineName)}` : norm(producer);
        if (!key) return null;
        return {
          producer,
          wine_name: wineName,
          region: typeof r?.region === 'string' && r.region.trim() ? r.region.trim() : null,
          grape: typeof r?.grape === 'string' && r.grape.trim() ? r.grape.trim() : null,
          style: typeof r?.style === 'string' && r.style.trim() ? r.style.trim() : null,
          search_key: key,
          display: [producer, wineName].filter(Boolean).join(' '),
          source: 'seed',
        };
      })
      .filter((r): r is NonNullable<typeof r> => !!r);

    // Dedup within the batch by search_key so the upsert doesn't self-conflict.
    const byKey = new Map<string, typeof rows[number]>();
    for (const r of rows) if (!byKey.has(r.search_key)) byKey.set(r.search_key, r);
    const unique = Array.from(byKey.values());

    if (unique.length === 0) return json({ inserted: 0, parsed: parsed.length }, 200);

    // Ignore duplicates already in the catalog (keep the earliest / verified row).
    const { error, count: inserted } = await admin
      .from('wines_catalog')
      .upsert(unique, { onConflict: 'search_key', ignoreDuplicates: true, count: 'exact' });
    if (error) return json({ error: error.message, parsed: parsed.length }, 500);

    return json({ inserted: inserted ?? 0, batch: unique.length, parsed: parsed.length }, 200);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
}
