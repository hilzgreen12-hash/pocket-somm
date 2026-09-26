// Verify wines_catalog rows against Wine-Searcher and make the most of idle API
// quota. For each unchecked row it does ONE all-vintage lookup via the deployed
// wine-searcher-proxy (which CACHES the result ~30 days — so a real user's later
// lookup is a free, instant cache hit), then records the outcome:
//   * ws_matched  — true if WS knows the wine (real; cache now warm), false if not
//                   (a hallucination candidate for cleanup)
//   * region / grape — filled from WS when the catalog row was blank (enrichment)
//   * ws_checked_at — always stamped, so nothing is re-queried (resumable)
//
// Optionally (warmYears > 0) it also queries a window of recent vintages per wine
// to pre-warm the pricing cache for the exact (wine, vintage) lookups intel makes
// — this multiplies API calls by ~warmYears, so it's off unless asked for.
//
// Service role (writes bypass RLS). Call in a loop until remaining = 0.
// POST body: { limit?: number (1–60, default 30), warmYears?: number (0–15, default 0) }

import { createClient } from 'npm:@supabase/supabase-js';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

interface CatalogRow { id: string; display: string; region: string | null; grape: string | null }
interface WsResult { matched: boolean; region: string | null; grape: string | null }

async function proxyLookup(display: string, vintage: number | null): Promise<WsResult> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/wine-searcher-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_ROLE}`,
        apikey: SERVICE_ROLE,
      },
      body: JSON.stringify({ wineName: display, vintage }),
    });
    if (!res.ok) return { matched: false, region: null, grape: null };
    const d = await res.json().catch(() => ({}));
    const matched = d?.source === 'wine-searcher' && d?.matched !== false;
    return { matched, region: d?.region ?? null, grape: d?.grape ?? null };
  } catch {
    return { matched: false, region: null, grape: null };
  }
}

Deno.serve(async (req) => {
  try {
    const { limit, warmYears } = await req.json().catch(() => ({}));
    const batch = Math.min(Math.max(Number(limit) || 30, 1), 60);
    const years = Math.min(Math.max(Number(warmYears) || 0, 0), 15);

    const { data: rows, error } = await admin
      .from('wines_catalog')
      .select('id, display, region, grape')
      .is('ws_checked_at', null)
      .order('hit_count', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(batch);
    if (error) return json({ error: error.message }, 500);

    const work = (rows ?? []) as CatalogRow[];
    let matched = 0;
    let apiCalls = 0;
    let enriched = 0;
    const now = new Date().toISOString();
    const nowYear = new Date().getFullYear();

    // Sequential — keeps the Wine-Searcher request rate gentle.
    for (const r of work) {
      const query = (r.display ?? '').trim();
      if (!query) { await admin.from('wines_catalog').update({ ws_checked_at: now, ws_matched: false }).eq('id', r.id); continue; }

      const ws = await proxyLookup(query, null);
      apiCalls++;
      const patch: Record<string, unknown> = { ws_checked_at: now, ws_matched: ws.matched };
      if (ws.matched) {
        matched++;
        // Enrich only blanks — never overwrite curated data.
        if (!r.region && ws.region) { patch.region = ws.region; enriched++; }
        if (!r.grape && ws.grape) { patch.grape = ws.grape; }
        // Pre-warm the pricing cache for the vintage lookups intel actually makes.
        for (let y = nowYear - 1; y >= nowYear - years; y--) {
          await proxyLookup(query, y);
          apiCalls++;
        }
      }
      await admin.from('wines_catalog').update(patch).eq('id', r.id);
    }

    const { count: remaining } = await admin
      .from('wines_catalog')
      .select('id', { count: 'exact', head: true })
      .is('ws_checked_at', null);

    return json({ checked: work.length, matched, unmatched: work.length - matched, enriched, apiCalls, remaining: remaining ?? 0 }, 200);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
}
