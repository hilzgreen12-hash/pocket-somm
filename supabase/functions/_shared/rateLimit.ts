import { createClient } from 'npm:@supabase/supabase-js';

/**
 * Usage limits for the paid (AI / Wine-Searcher) edge functions — a spend
 * control, not an authorization check.
 *
 * - Signed-in users: counted per account (function_call_log, mig 031).
 * - Guests (the app's public key, no account): counted per device address,
 *   stored only as a one-way hash (guest_call_log, mig 132). Restaurant Wi-Fi
 *   can put several guests behind one address, so the same generous limits apply.
 * - Calls made by scan-start on a user's behalf (x-vinster-internal) are not
 *   counted again: scan-start limits the scan itself.
 *
 * DELIBERATELY FAILS OPEN: a 429 only when a caller is genuinely over a limit.
 * If the limit check itself fails (a database blip, a missing table), the call
 * goes ahead rather than locking out legitimate users.
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
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    if (req.headers.get('x-vinster-internal') === serviceKey) return null;
    const adminClient = createClient(Deno.env.get('SUPABASE_URL')!, serviceKey);
    const authHeader = req.headers.get('Authorization');

    let user: { id: string } | null = null;
    if (authHeader) {
      const userClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } },
      );
      const { data } = await userClient.auth.getUser();
      user = data?.user ?? null;
    }

    const { data: allowed, error: rlError } = user
      ? await adminClient.rpc('check_and_log_function_call', {
          p_user_id: user.id,
          p_function_name: functionName,
          p_hourly_limit: hourlyLimit,
          p_daily_limit: dailyLimit,
        })
      : await adminClient.rpc('check_and_log_guest_call', {
          p_guest_key: await guestKey(req),
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

// A guest's device address as a one-way hash (same scheme as scan-start).
async function guestKey(req: Request): Promise<string> {
  const ip = (req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`vinster-guest:${ip}`));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}
