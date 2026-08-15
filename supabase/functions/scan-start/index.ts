import { createClient } from 'npm:@supabase/supabase-js';

// Async wine-list scan orchestrator.
//
// The client used to hold ONE ~90s connection open for OCR → recommend, so a
// momentary network blip lost the whole thing (the 50% success rate). Instead:
// this returns a jobId in <1s, then runs OCR → recommend IN THE BACKGROUND
// (EdgeRuntime.waitUntil) — reusing the existing `ocr` and `recommend` functions
// server-to-server (far more reliable than a mobile leg) — writing each stage to
// the scan_jobs row. The app polls that row and collects the finished result, so
// a dropped connection / backgrounded app never throws away the work.

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

// Reliable server-to-server call to another edge function, buffered (no stream).
async function callFn(name: string, body: unknown, authHeader: string): Promise<any> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: authHeader, apikey: ANON_KEY },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON */ }
  if (!res.ok) {
    // Surface the callee's friendly message (rate limit, etc.) when present.
    throw new Error(json?.message || `${name} ${res.status}: ${text.slice(0, 200)}`);
  }
  return json;
}

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const admin = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  try {
    // Resolve the user (rate limiting + row ownership) before creating a job.
    const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const { imageBase64, params } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'imageBase64 required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Create the job row up front (service role) so the client has something to
    // poll immediately. The nested ocr/recommend calls enforce their own
    // per-user rate limits, so no separate limiter is needed here.
    const { data: job, error: insertError } = await admin
      .from('scan_jobs')
      .insert({ user_id: user.id, status: 'pending', params: params ?? {} })
      .select('id')
      .single();
    if (insertError || !job?.id) {
      throw new Error(`could not create scan job: ${insertError?.message ?? 'no id'}`);
    }
    const jobId = job.id as string;

    // The background work — reuses ocr + recommend server-to-server, buffered.
    const patch = (fields: Record<string, unknown>) =>
      admin.from('scan_jobs').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', jobId);

    const work = (async () => {
      try {
        await patch({ status: 'reading' });
        const ocrRes = await callFn('ocr', { imageBase64 }, authHeader);
        const wines = Array.isArray(ocrRes?.wines) ? ocrRes.wines : [];
        await patch({ status: 'recommending', extracted_wines: wines });
        if (wines.length === 0) {
          throw new Error("Vinster couldn't read any wines from this photo. Try a clearer, well-lit shot with the list fully in frame.");
        }
        // recommend expects the wine list + the diner's params; buffered (no SSE).
        const rec = await callFn('recommend', { ...(params ?? {}), wines, stream: false }, authHeader);
        await patch({ status: 'done', result: rec });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[scan-start] job failed:', jobId, message);
        await patch({
          status: 'error',
          error: /minute|rate limit|too many|read any wines/i.test(message)
            ? message
            : 'Vinster had trouble with this scan. Please try again — a second attempt usually works.',
        });
      }
    })();

    // Keep the worker alive to finish the work AFTER we return the response.
    try { (globalThis as any).EdgeRuntime?.waitUntil?.(work); }
    catch { /* if unavailable, the promise still runs while the worker lives */ }

    return new Response(JSON.stringify({ jobId }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('scan-start error:', message);
    return new Response(
      JSON.stringify({ error: 'scan_start_failed', message: 'Could not start the scan. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
