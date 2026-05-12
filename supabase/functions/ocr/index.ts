import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

// Per-user rate limits — generous for real use, tight enough to stop abuse.
// Roughly 1-3 photo scans per dining outing × multiple outings/day is well
// under these limits. Anyone hitting them is making sustained automated
// calls.
const OCR_HOURLY_LIMIT = 30;
const OCR_DAILY_LIMIT = 100;

const WINE_FIELDS = `For each wine return a JSON object with these fields:
- name: the wine name (string)
- producer: producer or domaine (string)
- region: broad region e.g. "Burgundy", "Bordeaux", "Napa Valley" (string)
- appellation: specific appellation e.g. "Puligny-Montrachet", "Pauillac" (string, optional)
- grape: grape variety or blend e.g. "Chardonnay", "Cabernet Sauvignon/Merlot" (string, optional)
- vintage: 4-digit year as integer, or null if non-vintage (number | null)
- menuPrice: numeric price as listed on the menu, null if not shown (number | null).
  IMPORTANT: many wine lists show two or more prices for the same wine —
  e.g. by-the-glass alongside by-the-bottle (175ml / 250ml / bottle, or
  similar pour-size columns). When multiple prices are shown for a single
  wine, always pick the HIGHEST one — that is the bottle price. Do not
  return the glass price. If a wine is genuinely glass-only (no bottle
  listed), return that price.
- currency: 3-letter currency code, default "GBP" (string)

IMPORTANT: Return ONLY raw valid JSON — no markdown, no code blocks, no backticks, no explanation.
Use this exact format:
{ "wines": [ ...wine objects... ] }

If you cannot identify any wines, return: { "wines": [] }`;

const IMAGE_SYSTEM_PROMPT = `You are a wine list parser. Extract every wine from the provided image of a restaurant wine list.\n\n${WINE_FIELDS}`;

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    // Resolve the user from the JWT — we need user_id to rate-limit per
    // user, and we want to reject expired/invalid tokens before paying
    // for a Claude call.
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    // Rate-limit check via service-role RPC. Fail open on infrastructure
    // errors (logged) so a Supabase blip doesn't lock out legitimate users.
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const { data: allowed, error: rlError } = await adminClient.rpc('check_and_log_function_call', {
      p_user_id: user.id,
      p_function_name: 'ocr',
      p_hourly_limit: OCR_HOURLY_LIMIT,
      p_daily_limit: OCR_DAILY_LIMIT,
    });
    if (rlError) {
      console.error('[ocr] rate-limit RPC failed (failing open):', rlError);
    } else if (allowed === false) {
      return new Response(
        JSON.stringify({
          error: 'rate_limit_exceeded',
          message: "You've made a lot of scans recently — please try again in a few minutes.",
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { imageBase64 } = body;

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'imageBase64 required' }), { status: 400 });
    }

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8192,
      system: IMAGE_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 },
            },
            { type: 'text', text: 'Extract all wines from this wine list. When a wine has multiple prices (glass + bottle, or different pour sizes), use the highest one — the bottle price. Return only JSON.' },
          ],
        },
      ],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';

    // Extract JSON object from response regardless of surrounding text
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`No JSON found in response: ${text.slice(0, 200)}`);
    const parsed = JSON.parse(match[0]);

    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('OCR function error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
