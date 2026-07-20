import { createClient } from 'npm:@supabase/supabase-js';

/**
 * Per-user rate limiting for expensive Claude-backed edge functions.
 *
 * Only `ocr` and `recommend` were gated; every other function could be looped
 * by a single account for unbounded Anthropic spend. `generate-pairings` is
 * the worst case at 8192 max_tokens on Sonnet with a ~65s stream per call.
 *
 * DELIBERATELY FAILS OPEN. This returns a 429 Response only when a resolved
 * user is genuinely over their limit; in every other case it returns null and
 * the caller proceeds as before. That covers three cases:
 *
 *  1. No usable JWT. Callers are not uniformly authenticated — pairingsStream.ts
 *     falls back to the anon key when there is no session, so requiring a user
 *     here would turn a working signed-out request into a 401. Rate limiting is
 *     a spend control, not an authorization boundary; the platform's verify_jwt
 *     already handles authorization. Adding a new rejection path is out of scope.
 *  2. The rate-limit RPC itself errors. A Supabase blip must not lock out
 *     legitimate users — matches the existing behaviour in ocr/index.ts.
 *  3. Anything unexpected throws. Same reasoning.
 *
 * Returns a 429 Response to return early, or null to proceed.
 */
export async function checkRateLimit(
  req: Request,
  functionName: string,
  hourlyLimit: number,
  dailyLimit: number,
): Promise<Response | null> {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return null;

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: userError } = await userClient.auth.getUser();

    // No resolvable user (anon-key caller, expired token) — see case 1 above.
    if (userError || !user) return null;

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const { data: allowed, error: rlError } = await adminClient.rpc('check_and_log_function_call', {
      p_user_id: user.id,
      p_function_name: functionName,
      p_hourly_limit: hourlyLimit,
      p_daily_limit: dailyLimit,
    });

    if (rlError) {
      console.error(`[${functionName}] rate-limit RPC failed (failing open):`, rlError);
      return null;
    }

    if (allowed === false) {
      return new Response(
        JSON.stringify({
          error: 'rate_limit_exceeded',
          message: "You've made a lot of requests recently — please try again in a few minutes.",
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return null;
  } catch (err) {
    console.error(`[${functionName}] rate-limit check threw (failing open):`, err);
    return null;
  }
}
