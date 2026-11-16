import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js';
import { guestDeviceKey, guestNetworkKey } from './guest.ts';

/**
 * Usage limits for the paid (AI / Wine-Searcher) edge functions — a spend
 * control, not an authorization check.
 *
 * - Signed-in users: counted per account (function_call_log, mig 031).
 * - Guests (the app's public key, no account): counted per PHONE with the
 *   tighter `guestLimits` (enough for their two scans a day), and per network
 *   address with the normal limits as an abuse backstop — restaurant Wi-Fi puts
 *   many guests behind one address. Older app versions send no phone id and are
 *   counted per network only. Stored as one-way hashes (guest_call_log, mig 132).
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
  guestLimits?: { hourly: number; daily: number },
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
      : await guestAllowed(adminClient, req, functionName, hourlyLimit, dailyLimit, guestLimits);

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

// A guest passes when their phone is within `guestLimits` AND their network
// within the normal limits. Returns the RPC's { data, error } shape.
async function guestAllowed(
  admin: SupabaseClient,
  req: Request,
  functionName: string,
  hourlyLimit: number,
  dailyLimit: number,
  guestLimits?: { hourly: number; daily: number },
): Promise<{ data: boolean | null; error: { message: string } | null }> {
  const check = (key: string, hourly: number, daily: number) => admin.rpc('check_and_log_guest_call', {
    p_guest_key: key, p_function_name: functionName, p_hourly_limit: hourly, p_daily_limit: daily,
  });
  const device = guestLimits ? await guestDeviceKey(req) : null;
  if (device) {
    const byPhone = await check(device, guestLimits!.hourly, guestLimits!.daily);
    if (byPhone.error || byPhone.data === false) return byPhone;
  }
  return await check(await guestNetworkKey(req), hourlyLimit, dailyLimit);
}
