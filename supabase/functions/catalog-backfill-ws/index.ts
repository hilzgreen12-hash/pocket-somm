// Verify wines_catalog rows against Wine-Searcher and stamp the canonical
// ws_wine_id / ws_wine_name anchor (a real match also PROVES the row is a real
// wine — a non-match flags a likely hallucination for the audit pass).
//
// Runs with the service role (writes bypass RLS). Quota-friendly + resumable: it
// processes a batch of rows still missing an id that haven't been checked yet
// (most-searched first via the mig-108 partial index), calls the deployed
// wine-searcher-proxy for each — whose 30-day cache makes repeats free — and
// ALWAYS stamps ws_checked_at so an unmatched wine is never re-queried on the next
// pass. Call it in a loop from the client/CLI until `remaining` reaches 0.
//
// POST body: { limit?: number }  (batch size, default 25, capped at 60 so a batch
// stays inside the function timeout given ~1–3s per live Wine-Searcher lookup).

import { createClient } from 'npm:@supabase/supabase-js';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

interface CatalogRow { id: string; producer: string | null; wine_name: string | null; display: string }

// Resolve one wine's WS anchor via the deployed proxy (server-to-server call,
// authorised with the service role). vintage null = all-vintage lookup, matching
// how the catalog is vintage-agnostic.
async function resolveAnchor(display: string): Promise<{ wsWineId: string | null; wsWineName: string | null }> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/wine-searcher-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SERVICE_ROLE}`,
      apikey: SERVICE_ROLE,
    },
    body: JSON.stringify({ wineName: display, vintage: null }),
  });
  if (!res.ok) return { wsWineId: null, wsWineName: null };
  const data = await res.json().catch(() => ({}));
  if (data?.source === 'wine-searcher' && data?.matched !== false && data?.wsWineId) {
    return { wsWineId: String(data.wsWineId), wsWineName: data.wsWineName ? String(data.wsWineName) : null };
  }
  return { wsWineId: null, wsWineName: null };
}

Deno.serve(async (req) => {
  try {
    const { limit } = await req.json().catch(() => ({}));
    const batch = Math.min(Math.max(Number(limit) || 25, 1), 60);

    const { data: rows, error } = await admin
      .from('wines_catalog')
      .select('id, producer, wine_name, display')
      .is('ws_wine_id', null)
      .is('ws_checked_at', null)
      .order('hit_count', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(batch);
    if (error) return json({ error: error.message }, 500);

    const work = (rows ?? []) as CatalogRow[];
    let matched = 0;
    const now = new Date().toISOString();

    // Sequential — keeps the Wine-Searcher request rate gentle (its own daily
    // quota is the real constraint; the proxy retries transient failures).
    for (const r of work) {
      const query = (r.display ?? '').trim();
      let anchor = { wsWineId: null as string | null, wsWineName: null as string | null };
      if (query) {
        try { anchor = await resolveAnchor(query); } catch { /* leave unmatched */ }
      }
      const patch: Record<string, unknown> = { ws_checked_at: now };
      if (anchor.wsWineId) {
        patch.ws_wine_id = anchor.wsWineId;
        if (anchor.wsWineName) patch.ws_wine_name = anchor.wsWineName;
        matched++;
      }
      await admin.from('wines_catalog').update(patch).eq('id', r.id);
    }

    // How many still need checking after this batch.
    const { count: remaining } = await admin
      .from('wines_catalog')
      .select('id', { count: 'exact', head: true })
      .is('ws_wine_id', null)
      .is('ws_checked_at', null);

    return json({ checked: work.length, matched, unmatched: work.length - matched, remaining: remaining ?? 0 }, 200);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
}
