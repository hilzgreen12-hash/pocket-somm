import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js';

// Small, fast, single-wine companion to `recommend`. The recommendation call no
// longer generates the long per-wine "Vinster's Review" (rationale) up front —
// that was the heaviest field and most diners never expand it. Instead the
// results card fetches it here on demand when the chevron is tapped, so the
// main 3-wine generation stays light and quick (the fix for the slow/failed
// wine-list scans). maxRetries covers peak-hour transient overloads.
const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')!, maxRetries: 4 });

// Generous per-user limits — one tap per wine, but a diner may open several.
const HOURLY_LIMIT = 120;
const DAILY_LIMIT = 400;

const SYSTEM_PROMPT = `You are Vinster, an expert sommelier with encyclopaedic knowledge of wine regions, producers, vintages and styles.

Write a short sommelier TASTING / CHARACTER note (2–3 sentences) on what the given wine is actually like in the glass — its style and personality, aromatics, texture, structure and overall impression, with a little colour and warmth. This is a TASTING note (shown to the diner as "Vinster's Review"), NOT a place for food pairing, occasion, price, value, critic scores, or comparison with other wines. Do not restate the producer, region, grape or vintage as facts — describe the wine. Keep it evocative but grounded and specific to this wine and vintage.

Return ONLY the note as plain text — no JSON, no markdown, no label, no preamble.`;

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    // Reuse the shared per-user rate limiter. Fail open on infra errors.
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const { data: allowed, error: rlError } = await adminClient.rpc('check_and_log_function_call', {
      p_user_id: user.id,
      p_function_name: 'vinster-review',
      p_hourly_limit: HOURLY_LIMIT,
      p_daily_limit: DAILY_LIMIT,
    });
    if (rlError) {
      console.error('[vinster-review] rate-limit RPC failed (failing open):', rlError);
    } else if (allowed === false) {
      return new Response(
        JSON.stringify({ error: 'rate_limit_exceeded', message: "You've opened a lot of reviews recently — please try again in a few minutes." }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { producer, wineName, region, appellation, grape, vintage } = await req.json();

    const identity = [
      producer ? `Producer: ${producer}` : null,
      wineName ? `Wine: ${wineName}` : null,
      appellation ? `Appellation: ${appellation}` : region ? `Region: ${region}` : null,
      grape ? `Grape: ${grape}` : null,
      vintage ? `Vintage: ${vintage}` : 'Vintage: NV / unknown',
    ].filter(Boolean).join('\n');

    if (!producer && !wineName) {
      return new Response(JSON.stringify({ error: 'bad_request', message: 'A producer or wine name is required.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: `Write Vinster's Review for this wine:\n${identity}` }],
    });

    const review = msg.content
      .filter((b: { type: string }) => b.type === 'text')
      .map((b: { text: string }) => b.text)
      .join('')
      .trim();

    if (!review) {
      throw new Error('Empty review from model.');
    }

    return new Response(JSON.stringify({ review }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('vinster-review error:', message);
    return new Response(
      JSON.stringify({ error: 'review_failed', message: "Vinster couldn't write this review just now. Please try again." }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
