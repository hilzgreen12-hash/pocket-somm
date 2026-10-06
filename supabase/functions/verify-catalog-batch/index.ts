// Catalog verification pass. Pulls a batch of UNVERIFIED wines_catalog rows and asks
// Claude whether each is a REAL wine the named producer actually makes, writing the
// verdict back (plausible / implausible / needs_review). This is the first filter in
// the data-grounding initiative — it surfaces the plausible-but-fabricated AI-seeded
// entries that keyword checks can't ("Chateau Yum", a cuvée a producer doesn't make).
//
// LLM-plausible is NOT authoritative verification — a convincing fabrication can slip
// through and a real-but-obscure grower can be flagged. So verdicts are stored as
// 'plausible' (not 'verified'); authoritative upgrade (Wine-Searcher / manual) comes
// later, and 'implausible' rows go to human review before removal.
//
// Invoked server-side (service role, writes bypass RLS). Cost-bearing, so it's gated
// behind a shared admin secret. Run once with { limit: 200 } for a representative
// SAMPLE (measure the fabrication rate) before committing to the full ~28.5k sweep.
//
// Body: { limit?: number (rows this call, default 30, max 500),
//         batchSize?: number (wines per Claude call, default 25),
//         model?: string }
// Header: x-admin-secret: <CATALOG_ADMIN_SECRET>

import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

type Row = { id: string; producer: string; wine_name: string | null; region: string | null; grape: string | null; style: string | null };

function buildPrompt(rows: Row[]): string {
  const list = rows.map((r, i) =>
    `${i + 1}. producer="${r.producer ?? ''}", wine="${r.wine_name ?? '(sold under producer name)'}", region="${r.region ?? ''}", grape="${r.grape ?? ''}", style="${r.style ?? ''}"`
  ).join('\n');
  return `You are auditing a wine reference database for FABRICATED or MIS-ATTRIBUTED entries. For each numbered wine, decide whether it is a REAL wine that this specific producer actually makes.

Verdicts:
- "plausible": the producer is real AND genuinely makes this cuvée (or the wine is sold under the producer's own name), in a region/appellation consistent with the producer.
- "implausible": the producer doesn't exist; OR this producer does not make this cuvée; OR the cuvée belongs to a DIFFERENT producer (name the real one); OR the appellation/region is wrong for this producer; OR it looks invented. Example: "Bruno Clair" does not make a "Chenevottes" (that's a Chassagne-Montrachet 1er cru — Bruno Clair is in Marsannay/Gevrey); "Chateau Yum" is invented.
- "uncertain": a genuinely obscure producer/wine you cannot confidently place either way. Do NOT guess.

Be STRICT — it is better to flag a fabricated-looking entry "implausible" than wave it through. But do NOT mark a real-but-obscure grower "implausible" merely for being obscure; use "uncertain".

Wines:
${list}

Return ONLY a JSON array (no markdown, no prose) with one object per wine:
- "i": integer (the wine's number)
- "verdict": "plausible" | "implausible" | "uncertain"
- "reason": brief phrase, under 12 words
- "correctedProducer": string or null (the real producer, only if you're confident this cuvée is theirs)`;
}

function parseVerdicts(text: string): any[] {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  const m = cleaned.match(/\[[\s\S]*\]/);
  if (!m) return [];
  try { const p = JSON.parse(m[0]); return Array.isArray(p) ? p : []; } catch { return []; }
}

function mapStatus(verdict: string): 'plausible' | 'implausible' | 'needs_review' {
  const v = (verdict ?? '').toLowerCase();
  if (v === 'plausible') return 'plausible';
  if (v === 'implausible') return 'implausible';
  return 'needs_review';
}

async function verifyBatch(rows: Row[], model: string): Promise<{ updated: number; counts: Record<string, number>; examples: any[] }> {
  const resp = await client.messages.create({
    model,
    max_tokens: 4000,
    messages: [{ role: 'user', content: buildPrompt(rows) }],
  });
  const text = resp.content[0]?.type === 'text' ? resp.content[0].text : '';
  const verdicts = parseVerdicts(text);
  const byIndex = new Map<number, any>();
  for (const v of verdicts) if (typeof v?.i === 'number') byIndex.set(v.i, v);

  const counts: Record<string, number> = { plausible: 0, implausible: 0, needs_review: 0 };
  const examples: any[] = [];
  let updated = 0;
  const nowIso = new Date().toISOString();

  await Promise.all(rows.map(async (row, idx) => {
    const v = byIndex.get(idx + 1);
    // No verdict returned for this row → leave it unverified so a later run retries.
    if (!v) return;
    const status = mapStatus(v.verdict);
    counts[status] = (counts[status] ?? 0) + 1;
    const notes = [v.verdict, v.reason, v.correctedProducer ? `correct→ ${v.correctedProducer}` : '']
      .filter(Boolean).join(' · ').slice(0, 400);
    if (status === 'implausible' && examples.length < 25) {
      examples.push({ producer: row.producer, wine: row.wine_name, region: row.region, reason: v.reason, correctedProducer: v.correctedProducer ?? null });
    }
    const { error } = await admin.from('wines_catalog')
      .update({ verification_status: status, verified_source: 'llm-plausible', verified_at: nowIso, verification_notes: notes })
      .eq('id', row.id);
    if (!error) updated += 1;
  }));

  return { updated, counts, examples };
}

Deno.serve(async (req) => {
  try {
    const secret = Deno.env.get('CATALOG_ADMIN_SECRET');
    if (!secret || req.headers.get('x-admin-secret') !== secret) {
      return json({ error: 'forbidden' }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Math.max(Number(body?.limit) || 30, 1), 500);
    const batchSize = Math.min(Math.max(Number(body?.batchSize) || 25, 5), 40);
    const model = typeof body?.model === 'string' && body.model.trim() ? body.model.trim() : 'claude-sonnet-5-5';

    const { data: rows, error: fetchErr } = await admin.rpc('fetch_unverified_wines', { p_limit: limit });
    if (fetchErr) return json({ error: `fetch failed: ${fetchErr.message}` }, 500);
    const work = (rows ?? []) as Row[];
    if (work.length === 0) return json({ note: 'nothing left to verify', processed: 0 }, 200);

    // Split into Claude-sized chunks and run them concurrently (keeps the whole
    // invocation well under the edge-function time limit even for a 200-row sample).
    const chunks: Row[][] = [];
    for (let i = 0; i < work.length; i += batchSize) chunks.push(work.slice(i, i + batchSize));

    const results = await Promise.all(chunks.map((c) => verifyBatch(c, model).catch(() => ({ updated: 0, counts: {}, examples: [] }))));

    const totals: Record<string, number> = { plausible: 0, implausible: 0, needs_review: 0 };
    let updated = 0;
    const examples: any[] = [];
    for (const r of results) {
      updated += r.updated;
      for (const k of Object.keys(r.counts)) totals[k] = (totals[k] ?? 0) + (r.counts as any)[k];
      for (const e of r.examples) if (examples.length < 40) examples.push(e);
    }

    // Remaining unverified, for progress / to drive a sweep loop.
    const { count: remaining } = await admin.from('wines_catalog')
      .select('id', { count: 'exact', head: true }).eq('verification_status', 'unverified');

    const implausibleRate = updated > 0 ? +(100 * (totals.implausible ?? 0) / updated).toFixed(1) : 0;

    return json({
      processed: work.length,
      updated,
      counts: totals,
      implausible_pct: implausibleRate,
      remaining_unverified: remaining ?? null,
      implausible_examples: examples,
    }, 200);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
}
