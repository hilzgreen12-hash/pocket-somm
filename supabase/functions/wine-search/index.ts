// Predictive wine search (typeahead for manual entry) — CATALOGUE ONLY.
//
// Returns a shortlist of real wines from Vinster's local wines_catalog that
// match the typed text, each with clean producer / cuvée / region / style.
//
// The former Claude/LLM fallback (used when the catalogue returned < 3 rows) has
// been REMOVED: it "corrected" typos onto whatever real-sounding wine the model
// guessed and could present a non-existent / misheard wine as real, which breaks
// Vinster's hard rule never to present an unverified wine as real. No client
// calls this function any more (the in-app "Search a Wine" typeahead queries the
// catalogue directly), so it now only ever returns catalogue rows — or nothing.

import { createClient } from 'npm:@supabase/supabase-js';

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

interface Result {
  producer: string;
  wineName: string | null;
  region: string | null;
  style: string | null;
  grape: string | null;
}

Deno.serve(async (req) => {
  try {
    const { query } = await req.json().catch(() => ({}));
    const q = typeof query === 'string' ? query.trim() : '';
    if (q.length < 3) return json({ results: [] }, 200);

    const { data: cat } = await admin.rpc('search_wines_catalog', { q, lim: 8 });
    const results: Result[] = (Array.isArray(cat) ? cat : []).map((r: any) => ({
      producer: r.producer,
      wineName: r.wine_name ?? null,
      region: r.region ?? null,
      style: r.style ?? null,
      grape: r.grape ?? null,
    })).filter((r: Result) => r.producer);
    return json({ results, source: 'catalog' }, 200);
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
