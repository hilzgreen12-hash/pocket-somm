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
  // Prefer the whole array.
  const m = cleaned.match(/\[[\s\S]*\]/);
  if (m) { try { const p = JSON.parse(m[0]); if (Array.isArray(p)) return p; } catch { /* fall through */ } }
  // Salvage: parse each complete {...} object individually, so a response truncated
  // mid-array (max_tokens) still yields every verdict that fully came through.
  const out: any[] = [];
  for (const o of cleaned.match(/\{[^{}]*\}/g) ?? []) { try { out.push(JSON.parse(o)); } catch { /* skip partial */ } }
  return out;
}

function mapStatus(verdict: string): 'plausible' | 'implausible' | 'needs_review' {
  const v = (verdict ?? '').toLowerCase();
  if (v === 'plausible') return 'plausible';
  if (v === 'implausible') return 'implausible';
  return 'needs_review';
}

async function verifyBatch(rows: Row[], model: string): Promise<any> {
  let resp: any;
  try {
    resp = await client.messages.create({
      model,
      // sonnet-5-5 returns a thinking block by default; give the JSON verdicts ample
      // room on top of it so the array can't truncate (that zeroed the first runs).
      max_tokens: 16000,
      messages: [{ role: 'user', content: buildPrompt(rows) }],
    });
  } catch (e) {
    return { updated: 0, counts: {}, examples: [], parsed: 0, raw: '', stop: null, blocks: [], content: '', err: (e instanceof Error ? e.message : String(e)).slice(0, 300) };
  }
  const textBlock = (resp.content ?? []).find((b: any) => b?.type === 'text');
  const text = textBlock?.text ?? '';
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

  return { updated, counts, examples, parsed: verdicts.length, raw: text.slice(0, 180), err: null,
    stop: resp?.stop_reason ?? null, blocks: (resp.content ?? []).map((b: any) => b?.type), content: JSON.stringify(resp?.content ?? '').slice(0, 400) };
}

async function colourBatch(rows: Row[]): Promise<{ updated: number; counts: Record<string, number> }> {
  const list = rows.map((r, i) => `${i + 1}. producer="${r.producer ?? ''}", wine="${r.wine_name ?? ''}", region="${r.region ?? ''}", grape="${r.grape ?? ''}", style="${r.style ?? ''}"`).join('\n');
  const prompt = `For each wine below, state its COLOUR as exactly one of: red, white, rosé. Judge from producer, wine, region, grape and style.
- A rosé Champagne / sparkling is "rosé" even though the style is sparkling.
- A white Hermitage / white Burgundy is "white"; a red Hermitage is "red".
- Port, Ruby, Tawny, LBV, Vintage Port, red fortified → "red". White Port, Fino, Manzanilla, Amontillado, Oloroso, Pale Cream, amber Sherry → "white".
- Orange / amber / skin-contact wines → "white".

Wines:
${list}

Return ONLY a JSON array (no prose) of objects: {"i": <number>, "colour": "red" | "white" | "rosé"}.`;
  let resp: any;
  try { resp = await client.messages.create({ model: 'claude-sonnet-5-5', max_tokens: 4000, thinking: { type: 'between_tools' }, messages: [{ role: 'user', content: prompt }] }); }
  catch { return { updated: 0, counts: {} }; }
  const text = (resp.content ?? []).find((b: any) => b.type === 'text')?.text ?? '';
  const byIndex = new Map<number, any>();
  for (const v of parseVerdicts(text)) if (typeof v?.i === 'number') byIndex.set(v.i, v);
  const counts: Record<string, number> = {};
  let updated = 0;
  await Promise.all(rows.map(async (row, idx) => {
    const v = byIndex.get(idx + 1);
    if (!v) return;
    let col = String(v.colour ?? '').toLowerCase().trim();
    if (['rose', 'rosado', 'rosato', 'pink'].includes(col)) col = 'rosé';
    if (!['red', 'white', 'rosé'].includes(col)) return;
    counts[col] = (counts[col] ?? 0) + 1;
    const { error } = await admin.from('wines_catalog').update({ colour: col, colour_source: 'llm' }).eq('id', row.id);
    if (!error) updated += 1;
  }));
  return { updated, counts };
}

Deno.serve(async (req) => {
  try {
    const secret = Deno.env.get('CATALOG_ADMIN_SECRET');
    if (!secret || req.headers.get('x-admin-secret') !== secret) {
      return json({ error: 'forbidden' }, 403);
    }

    const body = await req.json().catch(() => ({}));

    // One-time admin SQL runner (DDL/migrations) via the direct DB connection that
    // edge functions get (SUPABASE_DB_URL) — lets migrations be applied without the
    // SQL editor. Gated behind the admin secret + --no-verify-jwt. Uses the simple
    // protocol so multi-statement migrations (incl. $$ blocks) run as one script.
    if (body?.runsql && typeof body.sql === 'string') {
      const dbUrl = Deno.env.get('SUPABASE_DB_URL');
      if (!dbUrl) return json({ error: 'SUPABASE_DB_URL not available' }, 500);
      const postgres = (await import('npm:postgres')).default;
      const sql = postgres(dbUrl, { prepare: false, max: 1, idle_timeout: 5 });
      try {
        await sql.unsafe(body.sql).simple();
        return json({ ok: true }, 200);
      } catch (e) {
        return json({ ok: false, error: e instanceof Error ? e.message : String(e) }, 500);
      } finally {
        try { await sql.end({ timeout: 5 }); } catch { /* ignore */ }
      }
    }

    // Diagnostic probe: replicate the generate-pairings-style Sonnet call (buffered AND
    // streamed) so we can see exactly what the model returns / why pairings fail.
    if (body?.probe) {
      const prompt = 'You are a chef. Return ONLY a JSON object (no prose) shaped {"pairings":[{"dishName":"...","recipe":{"ingredients":["..."],"instructions":["..."]}}]} with exactly 3 chef-inspired dishes to pair with a Chablis. Make each recipe complete.';
      const mk = (mt: number, stream: boolean): any => ({ model: 'claude-sonnet-5-5', max_tokens: mt, messages: [{ role: 'user', content: prompt }], ...(stream ? { stream: true } : {}) });
      const out: any = {};
      // Streamed @ 26000 (no temperature) — should now succeed.
      try { let f = ''; const s: any = await client.messages.create(mk(26000, true)); for await (const ev of s) { if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') f += ev.delta.text; } out.stream26k = { len: f.length, head: f.slice(0, 120) }; } catch (e) { out.stream26k = { error: (e instanceof Error ? e.message : String(e)).slice(0, 180) }; }
      // Buffered thresholds (no temperature) — find the safe ceiling.
      // Does DISABLING thinking work? If yes → content[0] is text again, no truncation,
      // and (maybe) temperature is re-allowed — a single root-cause fix.
      try {
        const b: any = await client.messages.create({ model: 'claude-sonnet-5-5', max_tokens: 4000, thinking: { type: 'between_tools' }, messages: [{ role: 'user', content: prompt }] });
        out.thinkingOff = { stop: b.stop_reason, blocks: (b.content ?? []).map((x: any) => x.type), c0: b.content?.[0]?.type, len: (b.content?.[0]?.type === 'text' ? b.content[0].text : '').length };
      } catch (e) { out.thinkingOff = { error: (e instanceof Error ? e.message : String(e)).slice(0, 180) }; }
      // between_tools + temperature — does turning thinking off re-allow temperature?
      try {
        const b: any = await client.messages.create({ model: 'claude-sonnet-5-5', max_tokens: 4000, thinking: { type: 'between_tools' }, temperature: 0.8, messages: [{ role: 'user', content: prompt }] });
        out.thinkingOffTemp = { stop: b.stop_reason, ok: true };
      } catch (e) { out.thinkingOffTemp = { error: (e instanceof Error ? e.message : String(e)).slice(0, 180) }; }
      return json(out, 200);
    }

    // Auto-correct: re-file implausible rows that carry a "correct→ Producer" suggestion
    // under their real producer (salvaging real wines filed under the wrong name). If the
    // corrected identity already exists (search_key collision), the mis-attributed row is
    // a duplicate and gets removed instead. Dry-run unless { apply: true }.
    if (body?.autocorrect) {
      const apply = body.apply === true;
      const { data: rows, error: selErr } = await admin.from('wines_catalog')
        .select('id, producer, wine_name, verification_notes')
        .eq('verification_status', 'implausible')
        .ilike('verification_notes', '%correct%');
      if (selErr) return json({ error: selErr.message }, 500);
      let refiled = 0, deletedDups = 0, skipped = 0;
      const samples: any[] = [];
      for (const r of (rows ?? []) as any[]) {
        const m = (r.verification_notes || '').match(/correct\s*(?:→|->|:)\s*(.+?)\s*$/i);
        const corrected = m ? m[1].trim().replace(/[.;,]$/, '').trim() : '';
        if (!corrected || corrected.toLowerCase() === (r.producer || '').toLowerCase()) { skipped++; continue; }
        if (!apply) { refiled++; if (samples.length < 30) samples.push({ action: 'would-refile', from: r.producer, to: corrected, wine: r.wine_name }); continue; }
        const upd = await admin.from('wines_catalog').update({
          producer: corrected,
          display: [corrected, r.wine_name].filter(Boolean).join(' '),
          verification_status: 'plausible',
          verified_source: 'llm-corrected',
          verified_at: new Date().toISOString(),
          verification_notes: `refiled from "${r.producer}" · ${r.verification_notes}`.slice(0, 400),
        }).eq('id', r.id);
        if (upd.error) {
          const del = await admin.from('wines_catalog').delete().eq('id', r.id);
          if (!del.error) { deletedDups++; if (samples.length < 30) samples.push({ action: 'dedup-delete', from: r.producer, to: corrected, wine: r.wine_name }); }
          else skipped++;
        } else { refiled++; if (samples.length < 30) samples.push({ action: 'refiled', from: r.producer, to: corrected, wine: r.wine_name }); }
      }
      return json({ apply, candidates: rows?.length ?? 0, refiled, deletedDups, skipped, samples }, 200);
    }

    // Colour LLM-refine pass: double-check the heuristic-assigned colour on the
    // ambiguous Sparkling/Fortified rows (and fill any nulls), marking colour_source='llm'.
    if (body?.colourfix) {
      const cl = Math.min(Math.max(Number(body?.limit) || 90, 1), 500);
      const bs = Math.min(Math.max(Number(body?.batchSize) || 20, 5), 40);
      const { data: rows, error: fe } = await admin.rpc('fetch_colour_todo', { p_limit: cl });
      if (fe) return json({ error: fe.message }, 500);
      const work = (rows ?? []) as Row[];
      if (work.length === 0) return json({ note: 'colour: done', processed: 0 }, 200);
      const chunks: Row[][] = [];
      for (let i = 0; i < work.length; i += bs) chunks.push(work.slice(i, i + bs));
      const results = await Promise.all(chunks.map((c) => colourBatch(c)));
      let updated = 0; const counts: Record<string, number> = {};
      for (const r of results) { updated += r.updated; for (const k of Object.keys(r.counts)) counts[k] = (counts[k] ?? 0) + (r.counts as any)[k]; }
      return json({ processed: work.length, updated, counts }, 200);
    }

    const limit = Math.min(Math.max(Number(body?.limit) || 30, 1), 500);
    const batchSize = Math.min(Math.max(Number(body?.batchSize) || 15, 5), 40);
    const model = typeof body?.model === 'string' && body.model.trim() ? body.model.trim() : 'claude-sonnet-5-5';

    const { data: rows, error: fetchErr } = await admin.rpc('fetch_unverified_wines', { p_limit: limit });
    if (fetchErr) return json({ error: `fetch failed: ${fetchErr.message}` }, 500);
    const work = (rows ?? []) as Row[];
    if (work.length === 0) return json({ note: 'nothing left to verify', processed: 0 }, 200);

    // Split into Claude-sized chunks and run them concurrently (keeps the whole
    // invocation well under the edge-function time limit even for a 200-row sample).
    const chunks: Row[][] = [];
    for (let i = 0; i < work.length; i += batchSize) chunks.push(work.slice(i, i + batchSize));

    const results = await Promise.all(chunks.map((c) => verifyBatch(c, model)));

    const totals: Record<string, number> = { plausible: 0, implausible: 0, needs_review: 0 };
    let updated = 0;
    const examples: any[] = [];
    const debug: any[] = [];
    for (const r of results) {
      updated += r.updated;
      for (const k of Object.keys(r.counts)) totals[k] = (totals[k] ?? 0) + (r.counts as any)[k];
      for (const e of r.examples) if (examples.length < 40) examples.push(e);
      if (debug.length < 3) debug.push({ parsed: r.parsed, err: r.err, raw: r.raw, stop: r.stop, blocks: r.blocks, content: r.content });
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
      debug,
    }, 200);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
}
