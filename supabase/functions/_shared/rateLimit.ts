import { createClient } from 'npm:@supabase/supabase-js';

/**
 * Usage limits for the paid (AI / Wine-Searcher) edge functions — a spend
 * control, not an authorization check. Callers are signed in (requireSignedIn
 * runs first), so each account is counted on its own (function_call_log, mig 031).
 *
 * DELIBERATELY FAILS OPEN: a 429 only when a caller is genuinely over a limit.
 * If the limit check itself fails (a database blip, a missing table), the call
 * goes ahead rather than locking out legitimate users.
 *
 * Returns a 429 Response to return early, or null to proceed.
 */
export async function checkRateLimit(
  userId: string,
  functionName: string,
  hourlyLimit: number,
  dailyLimit: number,
): Promise<Response | null> {
  try {
    const adminClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: allowed, error: rlError } = await adminClient.rpc('check_and_log_function_call', {
      p_user_id: userId,
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
