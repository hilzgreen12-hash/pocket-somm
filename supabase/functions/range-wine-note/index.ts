import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js';

// On-demand "inside line" for a single wine in a producer's range. The producer
// range (see producer-range fn) lists where the scanned wine sits among its
// siblings; tapping any wine in that list calls this to get a short, in-the-know
// note plus the key technical details (grape, region, style). Small + fast,
// modelled on vinster-review.
const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')!, maxRetries: 4 });

const HOURLY_LIMIT = 120;
const DAILY_LIMIT = 400;

const SYSTEM_PROMPT = `You are Vinster, an expert sommelier with encyclopaedic knowledge of wine producers and their ranges.

Given a producer and one of their wines, return the key technical details and a short "inside line" — the in-the-know context a great sommelier friend would give: where this wine sits in the producer's range, what makes it distinctive, how it's made or what to expect, and any reputation or rarity worth knowing. Grounded and specific, never generic filler.

Return ONLY valid JSON (no markdown, no prose outside the JSON) with exactly these keys:
- "grape": grape variety or blend (e.g. "Nebbiolo", "Cabernet Sauvignon/Merlot"), or null if there genuinely isn't a single/named varietal identity
- "region": region or appellation (e.g. "Barolo, Piedmont", "Pauillac, Bordeaux"), or null
- "style": one of "Red" | "White" | "Rosé" | "Sparkling" | "Fortified" | "Sweet", or null
- "note": 2–3 sentences of inside-line context on THIS wine within the producer's range (string). Do NOT restate the grape/region/style as a bare list — weave any facts naturally into the note.

If you do not confidently recognise the wine, still give your best real identification; only use null for a field you genuinely cannot determine.`;

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

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const { data: allowed, error: rlError } = await adminClient.rpc('check_and_log_function_call', {
      p_user_id: user.id,
      p_function_name: 'range-wine-note',
      p_hourly_limit: HOURLY_LIMIT,
      p_daily_limit: DAILY_LIMIT,
    });
    if (rlError) {
      console.error('[range-wine-note] rate-limit RPC failed (failing open):', rlError);
    } else if (allowed === false) {
      return new Response(
        JSON.stringify({ error: 'rate_limit_exceeded', message: "You've opened a lot of notes recently — please try again in a few minutes." }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { producer, wineName, region } = await req.json();
    if (!producer && !wineName) {
      return new Response(JSON.stringify({ error: 'bad_request', message: 'A producer or wine name is required.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const identity = [
      producer ? `Producer: ${producer}` : null,
      wineName ? `Wine: ${wineName}` : null,
      region ? `Region hint: ${region}` : null,
    ].filter(Boolean).join('\n');

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 700,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: `Give the inside line for this wine:\n${identity}` }],
    });

    const text = msg.content
      .filter((b: { type: string }) => b.type === 'text')
      .map((b: { text: string }) => b.text)
      .join('')
      .trim();

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`No JSON in response. Snippet: ${text.slice(0, 200)}`);
    const parsed = JSON.parse(match[0]);

    const clean = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);
    const result = {
      grape: clean(parsed?.grape),
      region: clean(parsed?.region),
      style: clean(parsed?.style),
      note: clean(parsed?.note) ?? '',
    };
    if (!result.note) throw new Error('Empty note from model.');

    return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('range-wine-note error:', message);
    return new Response(
      JSON.stringify({ error: 'note_failed', message: "Vinster couldn't pull the inside line just now. Please try again." }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
